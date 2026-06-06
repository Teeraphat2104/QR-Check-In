package handlers_test

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"

	"qr-check-in/internal/database"
	"qr-check-in/internal/models"
	"qr-check-in/internal/testutil"

	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

type studentAuthResp struct {
	Success bool `json:"success"`
	Data    *struct {
		Student any    `json:"student"`
		Token   string `json:"token"`
	} `json:"data"`
	Message string `json:"message"`
}

func TestStudentRegister_Success(t *testing.T) {
	testutil.CleanTables()

	body := `{"student_id":"REG-001","name":"New Student","password":"pass123456","email":"new@test.com","faculty":"Engineering","major":"CS","year":2}`
	resp, err := http.Post(testServer.URL+"/api/student/register", "application/json", strings.NewReader(body))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	var res studentAuthResp
	json.NewDecoder(resp.Body).Decode(&res)
	assert.True(t, res.Success)
	assert.NotEmpty(t, res.Data.Token)
}

func TestStudentRegister_DuplicateStudentID(t *testing.T) {
	testutil.CleanTables()

	testutil.SeedStudent(func(s *models.Student) {
		s.StudentID = "DUP-001"
	})

	body := `{"student_id":"DUP-001","name":"Duplicate","password":"pass123456"}`
	resp, err := http.Post(testServer.URL+"/api/student/register", "application/json", strings.NewReader(body))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusConflict, resp.StatusCode)
}

func TestStudentRegister_MissingFields(t *testing.T) {
	testutil.CleanTables()

	tests := []struct {
		name string
		body string
	}{
		{"no student_id", `{"name":"X","password":"pass123456"}`},
		{"no name", `{"student_id":"X","password":"pass123456"}`},
		{"no password", `{"student_id":"X","name":"X"}`},
		{"short password", `{"student_id":"X","name":"X","password":"12345"}`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := http.Post(testServer.URL+"/api/student/register", "application/json", strings.NewReader(tt.body))
			assert.NoError(t, err)
			defer resp.Body.Close()
			assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
		})
	}
}

func TestStudentLogin_Success(t *testing.T) {
	testutil.CleanTables()

	hash, _ := bcrypt.GenerateFromPassword([]byte("pass123456"), bcrypt.DefaultCost)
	database.DB.Exec(`INSERT INTO students (id, student_id, name, password_hash, created_at, updated_at) VALUES (gen_random_uuid(), 'LOGIN-001', 'Login Student', $1, NOW(), NOW())`, string(hash))

	resp, err := http.Post(testServer.URL+"/api/student/login", "application/json", strings.NewReader(`{"student_id":"LOGIN-001","password":"pass123456"}`))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var res studentAuthResp
	json.NewDecoder(resp.Body).Decode(&res)
	assert.True(t, res.Success)
	assert.NotEmpty(t, res.Data.Token)
}

func TestStudentLogin_WrongPassword(t *testing.T) {
	testutil.CleanTables()

	hash, _ := bcrypt.GenerateFromPassword([]byte("correct-pw"), bcrypt.DefaultCost)
	database.DB.Exec(`INSERT INTO students (id, student_id, name, password_hash, created_at, updated_at) VALUES (gen_random_uuid(), 'LOGIN-002', 'Test', $1, NOW(), NOW())`, string(hash))

	resp, err := http.Post(testServer.URL+"/api/student/login", "application/json", strings.NewReader(`{"student_id":"LOGIN-002","password":"wrong-pw"}`))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestStudentLogin_UnknownID(t *testing.T) {
	testutil.CleanTables()

	resp, err := http.Post(testServer.URL+"/api/student/login", "application/json", strings.NewReader(`{"student_id":"NONEXISTENT","password":"whatever"}`))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestStudentProfile_Unauthorized(t *testing.T) {
	testutil.CleanTables()

	resp, err := http.Get(testServer.URL + "/api/student/profile")
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestStudentProfile_Success(t *testing.T) {
	testutil.CleanTables()

	student := testutil.SeedStudent(func(s *models.Student) {
		s.StudentID = "PROFILE-001"
		s.Name = "Profile Student"
	})
	cfg := testutil.TestConfig()
	token := testutil.GenerateStudentToken(student, cfg.SupabaseJWTSecret)

	req, _ := http.NewRequest("GET", testServer.URL+"/api/student/profile", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := http.DefaultClient.Do(req)
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	data, _ := io.ReadAll(resp.Body)
	assert.Contains(t, string(data), "PROFILE-001")
	assert.Contains(t, string(data), "Profile Student")
}

func TestStudentHistory_Empty(t *testing.T) {
	testutil.CleanTables()

	student := testutil.SeedStudent(func(s *models.Student) {
		s.StudentID = "HIST-001"
	})
	cfg := testutil.TestConfig()
	token := testutil.GenerateStudentToken(student, cfg.SupabaseJWTSecret)

	req, _ := http.NewRequest("GET", testServer.URL+"/api/student/history", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := http.DefaultClient.Do(req)
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	data, _ := io.ReadAll(resp.Body)
	assert.Contains(t, string(data), `"data":[]`)
}

func TestStudentHistory_WithData(t *testing.T) {
	testutil.CleanTables()

	student := testutil.SeedStudent(func(s *models.Student) {
		s.StudentID = "HIST-002"
	})
	activity := testutil.SeedActivity()
	testutil.SeedParticipant(activity.ID, student.ID, true)

	cfg := testutil.TestConfig()
	token := testutil.GenerateStudentToken(student, cfg.SupabaseJWTSecret)

	req, _ := http.NewRequest("GET", testServer.URL+"/api/student/history", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := http.DefaultClient.Do(req)
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	data, _ := io.ReadAll(resp.Body)
	assert.Contains(t, string(data), "Test Activity")
}

func TestStudentHistory_Unauthorized(t *testing.T) {
	testutil.CleanTables()

	resp, err := http.Get(testServer.URL + "/api/student/history")
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}
