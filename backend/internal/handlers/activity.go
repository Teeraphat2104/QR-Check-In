package handlers

import (
	"net/http"
	"time"

	"qr-check-in/internal/database"
	"qr-check-in/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateActivityInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Date        string `json:"date" binding:"required"`
	Location    string `json:"location"`
	Category    string `json:"category"`
}

type UpdateActivityInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`
	Location    string `json:"location"`
	Category    string `json:"category"`
}

func ListActivities(c *gin.Context) {
	var activities []models.Activity
	query := database.DB

	if search := c.Query("search"); search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	result := query.Order("date DESC").Find(&activities)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to fetch activities",
		})
		return
	}

	if activities == nil {
		activities = []models.Activity{}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    activities,
	})
}

func GetActivity(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid activity id",
		})
		return
	}

	var activity models.Activity
	result := database.DB.Preload("Participants").First(&activity, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "activity not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    activity,
	})
}

func CreateActivity(c *gin.Context) {
	var input CreateActivityInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	date, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid date format, use YYYY-MM-DD",
		})
		return
	}

	activity := models.Activity{
		Title:       input.Title,
		Description: input.Description,
		Date:        date,
		Location:    input.Location,
		Category:    input.Category,
	}

	if err := database.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to create activity",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "activity created",
		"data":    activity,
	})
}

func UpdateActivity(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid activity id",
		})
		return
	}

	var activity models.Activity
	if err := database.DB.First(&activity, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "activity not found",
		})
		return
	}

	var input UpdateActivityInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	updates := map[string]interface{}{}
	if input.Title != "" {
		updates["title"] = input.Title
	}
	if input.Description != "" {
		updates["description"] = input.Description
	}
	if input.Date != "" {
		date, err := time.Parse("2006-01-02", input.Date)
		if err == nil {
			updates["date"] = date
		}
	}
	if input.Location != "" {
		updates["location"] = input.Location
	}
	if input.Category != "" {
		updates["category"] = input.Category
	}

	if err := database.DB.Model(&activity).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to update activity",
		})
		return
	}

	database.DB.First(&activity, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "activity updated",
		"data":    activity,
	})
}

func DeleteActivity(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid activity id",
		})
		return
	}

	result := database.DB.Delete(&models.Activity{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to delete activity",
		})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "activity not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "activity deleted",
	})
}

func GetParticipants(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid activity id",
		})
		return
	}

	var participants []models.ActivityParticipant
	result := database.DB.Where("activity_id = ?", id).
		Preload("Student").
		Order("checked_in_at ASC NULLS LAST, created_at DESC").
		Find(&participants)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to fetch participants",
		})
		return
	}

	if participants == nil {
		participants = []models.ActivityParticipant{}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    participants,
	})
}
