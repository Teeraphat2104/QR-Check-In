package main

import (
	"log"

	"qr-check-in/internal/config"
	"qr-check-in/internal/database"
	"qr-check-in/internal/router"
)

func main() {
	cfg := config.Load()

	database.Init(cfg)
	database.Migrate()

	r := router.Setup(cfg)

	log.Printf("Server starting on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
