package handlers

import (
	"net/http"
	"time"

	"qr-check-in/internal/database"
	"qr-check-in/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CheckInInput struct {
	StudentID string `json:"student_id" binding:"required"`
}

func CheckIn(c *gin.Context) {
	idStr := c.Param("id")
	activityID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid activity id",
		})
		return
	}

	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "missing check-in token",
		})
		return
	}

	var activity models.Activity
	if err := database.DB.First(&activity, "id = ?", activityID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "activity not found",
		})
		return
	}

	if activity.CheckInToken == nil || *activity.CheckInToken != token {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "invalid check-in token",
		})
		return
	}

	if activity.CheckInTokenExpiresAt != nil && activity.CheckInTokenExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "QR code has expired",
		})
		return
	}

	var input CheckInInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "student_id is required",
		})
		return
	}

	var student models.Student
	if err := database.DB.Where("student_id = ?", input.StudentID).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "student not found in the system",
		})
		return
	}

	var existing models.ActivityParticipant
	result := database.DB.Where("activity_id = ? AND student_id = ?", activityID, student.ID).First(&existing)
	if result.Error == nil {
		if existing.CheckedInAt != nil {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "already checked in",
				"data": gin.H{
					"checked_in_at": existing.CheckedInAt,
					"name":          existing.Name,
					"student_id":    student.StudentID,
				},
			})
			return
		}

		now := time.Now()
		existing.CheckedInAt = &now
		if err := database.DB.Save(&existing).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "failed to check in",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "check-in successful",
			"data": gin.H{
				"checked_in_at": now,
				"name":          existing.Name,
				"student_id":    student.StudentID,
			},
		})
		return
	}

	now := time.Now()
	participant := models.ActivityParticipant{
		ActivityID:  activityID,
		StudentID:   student.ID,
		Name:        student.Name,
		Faculty:     student.Faculty,
		CheckedInAt: &now,
	}

	if err := database.DB.Create(&participant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to check in",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "check-in successful",
		"data": gin.H{
			"checked_in_at": now,
			"name":          student.Name,
			"student_id":    student.StudentID,
		},
	})
}

func GetActivityInfo(c *gin.Context) {
	idStr := c.Param("id")
	activityID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid activity id",
		})
		return
	}

	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "missing check-in token",
		})
		return
	}

	var activity models.Activity
	if err := database.DB.First(&activity, "id = ?", activityID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "activity not found",
		})
		return
	}

	if activity.CheckInToken == nil || *activity.CheckInToken != token {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "invalid check-in token",
		})
		return
	}

	if activity.CheckInTokenExpiresAt != nil && activity.CheckInTokenExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "QR code has expired",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":          activity.ID,
			"title":       activity.Title,
			"description": activity.Description,
			"date":        activity.Date,
			"location":    activity.Location,
			"category":    activity.Category,
		},
	})
}
