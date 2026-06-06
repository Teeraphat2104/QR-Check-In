package database

import (
	"log"

	"qr-check-in/internal/config"
	"qr-check-in/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(cfg *config.Config) {
	var err error
	DB, err = gorm.Open(postgres.Open(cfg.SupabaseDBURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")
}

func Migrate() {
	err := DB.AutoMigrate(
		&models.Admin{},
		&models.Activity{},
		&models.Student{},
		&models.ActivityParticipant{},
	)
	if err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	log.Println("Database migrations completed")
}
