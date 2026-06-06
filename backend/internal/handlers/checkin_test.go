package handlers_test

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"qr-check-in/internal/models"
	"qr-check-in/internal/testutil"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func seedCheckInTestData(t *testing.T) (*models.Activity, *models.Student) {
	t.Helper()
	testutil.CleanTables()

	token := "valid-check-in-token-123"
	expires := time.Now().Add(24 * time.Hour)

	activity := testutil.SeedActivity(func(a *models.Activity) {
		a.CheckInToken = &token
		a.CheckInTokenExpiresAt = &expires
	})

	student := testutil.SeedStudent(func(s *models.Student) {
		s.StudentID = "STU-001"
	})

	return activity, student
}

func checkInURL(activityID, token string) string {
	return fmt.Sprintf("%s/api/check-in/%s?token=%s", testServer.URL, activityID, token)
}

func TestGetActivityInfo_Valid(t *testing.T) {
	activity, _ := seedCheckInTestData(t)

	resp, err := http.Get(checkInURL(activity.ID.String(), "valid-check-in-token-123"))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	body, _ := io.ReadAll(resp.Body)
	assert.Contains(t, string(body), "Test Activity")
	assert.Contains(t, string(body), "academic")
}

func TestGetActivityInfo_InvalidToken(t *testing.T) {
	activity, _ := seedCheckInTestData(t)

	resp, err := http.Get(checkInURL(activity.ID.String(), "wrong-token"))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestGetActivityInfo_ExpiredToken(t *testing.T) {
	testutil.CleanTables()
	expired := time.Now().Add(-24 * time.Hour)

	tok := "expired-token"
	activity := testutil.SeedActivity(func(a *models.Activity) {
		a.CheckInToken = &tok
		a.CheckInTokenExpiresAt = &expired
	})

	resp, err := http.Get(checkInURL(activity.ID.String(), "expired-token"))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestGetActivityInfo_NotFound(t *testing.T) {
	testutil.CleanTables()

	resp, err := http.Get(checkInURL(uuid.New().String(), "some-token"))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestCheckIn_Success(t *testing.T) {
	activity, student := seedCheckInTestData(t)

	body := fmt.Sprintf(`{"student_id":"%s"}`, student.StudentID)
	resp, err := http.Post(checkInURL(activity.ID.String(), "valid-check-in-token-123"), "application/json", strings.NewReader(body))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	data, _ := io.ReadAll(resp.Body)
	assert.Contains(t, string(data), "check-in successful")
}

func TestCheckIn_Duplicate(t *testing.T) {
	activity, student := seedCheckInTestData(t)
	_ = testutil.SeedParticipant(activity.ID, student.ID, true)

	body := fmt.Sprintf(`{"student_id":"%s"}`, student.StudentID)
	resp, err := http.Post(checkInURL(activity.ID.String(), "valid-check-in-token-123"), "application/json", strings.NewReader(body))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	data, _ := io.ReadAll(resp.Body)
	assert.Contains(t, string(data), "already checked in")
}

func TestCheckIn_MissingStudentID(t *testing.T) {
	activity, _ := seedCheckInTestData(t)

	resp, err := http.Post(checkInURL(activity.ID.String(), "valid-check-in-token-123"), "application/json", strings.NewReader(`{}`))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestCheckIn_UnknownStudent(t *testing.T) {
	activity, _ := seedCheckInTestData(t)

	resp, err := http.Post(checkInURL(activity.ID.String(), "valid-check-in-token-123"), "application/json", strings.NewReader(`{"student_id":"STU-NONEXISTENT"}`))
	assert.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}
