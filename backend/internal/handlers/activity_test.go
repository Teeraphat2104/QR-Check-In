package handlers_test

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"

	"qr-check-in/internal/testutil"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func adminHeaders(t *testing.T) map[string]string {
	t.Helper()
	admin := testutil.SeedAdmin()
	cfg := testutil.TestConfig()
	token := testutil.GenerateAdminToken(admin, cfg.SupabaseJWTSecret)
	return map[string]string{
		"Authorization": "Bearer " + token,
		"Content-Type":  "application/json",
	}
}

func authRequest(t *testing.T, method, url, body string, headers map[string]string) *http.Response {
	t.Helper()
	req, err := http.NewRequest(method, url, strings.NewReader(body))
	assert.NoError(t, err)
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	resp, err := http.DefaultClient.Do(req)
	assert.NoError(t, err)
	return resp
}

func TestActivity_Unauthorized(t *testing.T) {
	testutil.CleanTables()

	resp, err := http.Get(testServer.URL + "/api/activities")
	assert.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestActivity_CreateAndList(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	resp := authRequest(t, "POST", testServer.URL+"/api/activities", `{"title":"New Activity","date":"2026-07-01","location":"Room A","category":"workshop"}`, h)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)
	resp.Body.Close()

	resp = authRequest(t, "GET", testServer.URL+"/api/activities", "", h)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	data, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	assert.Contains(t, string(data), "New Activity")
	assert.Contains(t, string(data), "workshop")
}

func TestActivity_CreateMissingTitle(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	resp := authRequest(t, "POST", testServer.URL+"/api/activities", `{"date":"2026-07-01"}`, h)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	resp.Body.Close()
}

func TestActivity_SearchAndFilter(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	resp := authRequest(t, "POST", testServer.URL+"/api/activities", `{"title":"Unique Searchable","date":"2026-11-01","category":"sport"}`, h)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)
	resp.Body.Close()

	resp = authRequest(t, "GET", testServer.URL+"/api/activities?search=Unique", "", h)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	data, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	assert.Contains(t, string(data), "Unique Searchable")

	resp = authRequest(t, "GET", testServer.URL+"/api/activities?category=sport", "", h)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	data, _ = io.ReadAll(resp.Body)
	resp.Body.Close()
	assert.Contains(t, string(data), "Unique Searchable")
}

func TestActivity_UpdateNonExistent(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	resp := authRequest(t, "PUT", testServer.URL+"/api/activities/"+uuid.New().String(), `{"title":"Noop"}`, h)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestActivity_GetNonExistent(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	req, _ := http.NewRequest("GET", testServer.URL+"/api/activities/"+uuid.New().String(), nil)
	req.Header.Set("Authorization", h["Authorization"])
	resp, err := http.DefaultClient.Do(req)
	assert.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestActivity_DeleteNonExistent(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	req, _ := http.NewRequest("DELETE", testServer.URL+"/api/activities/"+uuid.New().String(), nil)
	req.Header.Set("Authorization", h["Authorization"])
	resp, err := http.DefaultClient.Do(req)
	assert.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestActivity_ListParticipantsNonExistent(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	resp := authRequest(t, "GET", fmt.Sprintf("%s/api/activities/%s/participants", testServer.URL, uuid.New().String()), "", h)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestActivity_FullCRUD(t *testing.T) {
	testutil.CleanTables()
	h := adminHeaders(t)

	// Create first
	resp := authRequest(t, "POST", testServer.URL+"/api/activities", `{"title":"First Activity","date":"2026-08-15"}`, h)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)
	resp.Body.Close()

	// Create second
	resp = authRequest(t, "POST", testServer.URL+"/api/activities", `{"title":"Second Activity","date":"2026-09-01","location":"Lab D","category":"workshop"}`, h)
	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	assert.Equal(t, http.StatusCreated, resp.StatusCode, "body: %s", string(bodyBytes))

	// List all
	resp = authRequest(t, "GET", testServer.URL+"/api/activities", "", h)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	list, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	assert.Contains(t, string(list), "First Activity")
	assert.Contains(t, string(list), "Second Activity")
}
