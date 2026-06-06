package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	SupabaseDBURL    string
	SupabaseJWTSecret string
	SupabaseURL      string
	SupabaseAnonKey  string
	ServerPort       string
	FrontendURL      string
}

func Load() *Config {
	godotenv.Load()

	cfg := &Config{
		SupabaseDBURL:     getEnv("SUPABASE_DB_URL", "postgres://postgres:postgres@localhost:5432/qrcheckin"),
		SupabaseJWTSecret: getEnv("SUPABASE_JWT_SECRET", ""),
		SupabaseURL:       getEnv("SUPABASE_URL", ""),
		SupabaseAnonKey:   getEnv("SUPABASE_ANON_KEY", ""),
		ServerPort:        getEnv("SERVER_PORT", "8080"),
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:4200"),
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
