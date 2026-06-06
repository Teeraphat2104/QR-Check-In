package handlers_test

import (
	"net/http"
	"testing"
	"time"

	"qr-check-in/internal/models"
	"qr-check-in/internal/testutil"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestQR_GenerateNonExistent(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	resp := authRequest(t, "POST", testServer.URL+"/api/activities/"+uuid.New().String()+"/generate-qr", ``, h)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestQR_RevokeNonExistent(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	resp := authRequest(t, "POST", testServer.URL+"/api/activities/"+uuid.New().String()+"/revoke-qr", ``, h)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestQR_ImageUnauthorized(t *testing.T) {
	resp, err := http.Get(testServer.URL + "/api/activities/" + uuid.New().String() + "/qr-image")
	assert.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestQR_AuthRequired(t *testing.T) {
	resp, err := http.Post(testServer.URL+"/api/activities/"+uuid.New().String()+"/generate-qr", "application/json", nil)
	assert.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestQR_GenerateAndRevoke(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	activity := testutil.SeedActivity(func(a *models.Activity) {
		a.Title = "QR Target"
		a.Date = time.Now().Add(24 * time.Hour)
	})

	// Generate QR
	resp := authRequest(t, "POST", testServer.URL+"/api/activities/"+activity.ID.String()+"/generate-qr", ``, h)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	resp.Body.Close()

	// Revoke QR
	resp = authRequest(t, "POST", testServer.URL+"/api/activities/"+activity.ID.String()+"/revoke-qr", ``, h)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	resp.Body.Close()
}
