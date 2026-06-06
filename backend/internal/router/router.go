package router

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"qr-check-in/internal/config"
	"qr-check-in/internal/handlers"
	"qr-check-in/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Setup(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware(cfg.FrontendURL))

	api := r.Group("/api")
	studentAuth := handlers.NewStudentAuthHandler(cfg)

	public := api.Group("")
	{
		public.GET("/check-in/:id", handlers.GetActivityInfo)
		public.POST("/check-in/:id", handlers.CheckIn)

		public.POST("/student/register", studentAuth.Register)
		public.POST("/student/login", studentAuth.Login)
	}

	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		protected.POST("/admin/sync", handlers.SyncAdmin)
		protected.GET("/admin/profile", handlers.GetProfile)

		protected.GET("/activities", handlers.ListActivities)
		protected.GET("/activities/:id", handlers.GetActivity)
		protected.POST("/activities", handlers.CreateActivity)
		protected.PUT("/activities/:id", handlers.UpdateActivity)
		protected.DELETE("/activities/:id", handlers.DeleteActivity)

		protected.GET("/activities/:id/participants", handlers.GetParticipants)

		qrHandler := handlers.NewQRHandler(cfg)
		protected.POST("/activities/:id/generate-qr", qrHandler.GenerateQR)
		protected.POST("/activities/:id/revoke-qr", qrHandler.RevokeQR)
		protected.GET("/activities/:id/qr-image", qrHandler.DownloadQRImage)
	}

	studentProtected := api.Group("")
	studentProtected.Use(middleware.StudentAuthMiddleware(cfg))
	{
		studentProtected.GET("/student/profile", studentAuth.GetProfile)
		studentProtected.GET("/student/history", handlers.GetStudentHistory)
	}

	staticDir := filepath.Join(".", "web", "dist")
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		if strings.HasPrefix(path, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "not found",
			})
			return
		}

		filePath := filepath.Join(staticDir, path)
		if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
			c.File(filePath)
			return
		}

		indexPath := filepath.Join(staticDir, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			c.File(indexPath)
			return
		}

		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "not found",
		})
	})

	return r
}
