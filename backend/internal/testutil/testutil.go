package testutil

import (
	"os"
	"time"

	"qr-check-in/internal/config"
	"qr-check-in/internal/database"
	"qr-check-in/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func SetupTestDB(cfg *config.Config) {
	var err error
	database.DB, err = gorm.Open(postgres.Open(cfg.SupabaseDBURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		panic("failed to connect test database: " + err.Error())
	}
	database.DB.AutoMigrate(
		&models.Admin{},
		&models.Activity{},
		&models.Student{},
		&models.ActivityParticipant{},
	)
	// Fix GORM incorrectly mapping Student.StudentID to uuid via FK naming collision
	database.DB.Exec("ALTER TABLE students DROP CONSTRAINT IF EXISTS fk_activity_participants_student")
	database.DB.Exec("ALTER TABLE students ALTER COLUMN student_id TYPE TEXT")
}

func CleanTables() {
	database.DB.Exec("TRUNCATE TABLE activity_participants CASCADE")
	database.DB.Exec("TRUNCATE TABLE activities CASCADE")
	database.DB.Exec("TRUNCATE TABLE students CASCADE")
	database.DB.Exec("TRUNCATE TABLE admins CASCADE")
}

func TestConfig() *config.Config {
	dbURL := os.Getenv("TEST_DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5433/qrcheckin_test"
	}
	return &config.Config{
		SupabaseDBURL:     dbURL,
		SupabaseJWTSecret: "test-secret-that-is-at-least-32-bytes-long!!!!!",
		ServerPort:        "0",
		FrontendURL:       "http://localhost:4200",
	}
}

func GenerateAdminToken(admin *models.Admin, secret string) string {
	claims := jwt.MapClaims{
		"sub": admin.SupabaseUID,
		"exp": time.Now().Add(1 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString([]byte(secret))
	return signed
}

func GenerateStudentToken(student *models.Student, secret string) string {
	claims := jwt.MapClaims{
		"sub":  student.ID.String(),
		"role": "student",
		"exp":  time.Now().Add(1 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString([]byte(secret))
	return signed
}

func SeedAdmin() *models.Admin {
	admin := &models.Admin{
		SupabaseUID: uuid.New().String(),
		Email:       "admin-" + uuid.New().String()[:8] + "@test.com",
		Name:        "Test Admin",
	}
	if err := database.DB.Create(admin).Error; err != nil {
		panic("SeedAdmin: " + err.Error())
	}
	return admin
}

func SeedStudent(override ...func(*models.Student)) *models.Student {
	student := &models.Student{
		StudentID:    "STU-" + uuid.New().String()[:8],
		Name:         "Test Student",
		PasswordHash: "$2a$10$dummyhashfortestingpurposesonly123456",
	}
	for _, fn := range override {
		fn(student)
	}
	if err := database.DB.Create(student).Error; err != nil {
		panic("SeedStudent: " + err.Error())
	}
	return student
}

func SeedActivity(override ...func(*models.Activity)) *models.Activity {
	activity := &models.Activity{
		Title:       "Test Activity",
		Description: "Description of test activity",
		Date:        time.Now().Add(24 * time.Hour),
		Location:    "Test Location",
		Category:    "academic",
	}
	for _, fn := range override {
		fn(activity)
	}
	if err := database.DB.Create(activity).Error; err != nil {
		panic("SeedActivity: " + err.Error())
	}
	return activity
}

func SeedParticipant(activityID, studentID uuid.UUID, checkedIn bool) *models.ActivityParticipant {
	p := &models.ActivityParticipant{
		ActivityID: activityID,
		StudentID:  studentID,
		Name:       "Test Student",
	}
	if checkedIn {
		now := time.Now()
		p.CheckedInAt = &now
	}
	if err := database.DB.Create(p).Error; err != nil {
		panic("SeedParticipant: " + err.Error())
	}
	return p
}
