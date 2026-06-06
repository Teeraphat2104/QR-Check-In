package handlers_test

import (
	"net/http/httptest"
	"os"
	"testing"

	"qr-check-in/internal/router"
	"qr-check-in/internal/testutil"
)

var testServer *httptest.Server

func TestMain(m *testing.M) {
	cfg := testutil.TestConfig()
	testutil.SetupTestDB(cfg)

	r := router.Setup(cfg)
	testServer = httptest.NewServer(r)

	code := m.Run()

	testServer.Close()
	testutil.CleanTables()
	os.Exit(code)
}
