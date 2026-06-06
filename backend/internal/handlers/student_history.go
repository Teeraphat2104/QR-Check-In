package handlers

import (
	"net/http"

	"qr-check-in/internal/database"
	"qr-check-in/internal/models"

	"github.com/gin-gonic/gin"
)

func GetStudentHistory(c *gin.Context) {
	studentRaw, exists := c.Get("student")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "unauthorized",
		})
		return
	}

	student := studentRaw.(*models.Student)

	var participants []models.ActivityParticipant
	result := database.DB.
		Where("student_id = ?", student.ID).
		Preload("Activity").
		Order("created_at DESC").
		Find(&participants)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to fetch history",
		})
		return
	}

	type HistoryItem struct {
		ID          string `json:"id"`
		ActivityID  string `json:"activity_id"`
		ActivityTitle string `json:"activity_title"`
		ActivityDate string `json:"activity_date"`
		Location    string `json:"location"`
		Category    string `json:"category"`
		CheckedInAt string `json:"checked_in_at"`
		CreatedAt   string `json:"created_at"`
	}

	history := []HistoryItem{}
	for _, p := range participants {
		item := HistoryItem{
			ID:          p.ID.String(),
			ActivityID:  p.ActivityID.String(),
			CheckedInAt: p.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			CreatedAt:   p.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
		if p.CheckedInAt != nil {
			item.CheckedInAt = p.CheckedInAt.Format("2006-01-02T15:04:05Z07:00")
		}
		if p.Activity != nil {
			item.ActivityTitle = p.Activity.Title
			item.ActivityDate = p.Activity.Date.Format("2006-01-02")
			item.Location = p.Activity.Location
			item.Category = p.Activity.Category
		}
		history = append(history, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    history,
	})
}
