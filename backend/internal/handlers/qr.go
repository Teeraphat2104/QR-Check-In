package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"qr-check-in/internal/config"
	"qr-check-in/internal/database"
	"qr-check-in/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	qrcode "github.com/skip2/go-qrcode"
)

type QRHandler struct {
	Config *config.Config
}

func NewQRHandler(cfg *config.Config) *QRHandler {
	return &QRHandler{Config: cfg}
}

func generateToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (h *QRHandler) GenerateQR(c *gin.Context) {
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

	if activity.CheckInTokenExpiresAt != nil && activity.CheckInTokenExpiresAt.After(time.Now()) {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "active QR code already exists, revoke it first",
		})
		return
	}

	token := generateToken()
	expiresAt := activity.Date.Add(24 * time.Hour)

	activity.CheckInToken = &token
	activity.CheckInTokenExpiresAt = &expiresAt

	if err := database.DB.Save(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to generate QR code",
		})
		return
	}

	checkInURL := h.Config.FrontendURL + "/check-in/" + id.String() + "?token=" + token

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "QR code generated",
		"data": gin.H{
			"check_in_url":            checkInURL,
			"check_in_token":          token,
			"check_in_token_expires_at": expiresAt,
		},
	})
}

func (h *QRHandler) RevokeQR(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid activity id",
		})
		return
	}

	result := database.DB.Model(&models.Activity{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"check_in_token":            nil,
			"check_in_token_expires_at": nil,
		})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to revoke QR code",
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
		"message": "QR code revoked",
	})
}

func (h *QRHandler) DownloadQRImage(c *gin.Context) {
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

	if activity.CheckInToken == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "no QR code generated for this activity",
		})
		return
	}

	checkInURL := h.Config.FrontendURL + "/check-in/" + id.String() + "?token=" + *activity.CheckInToken

	png, err := qrcode.Encode(checkInURL, qrcode.Medium, 512)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to generate QR image",
		})
		return
	}

	c.Header("Content-Type", "image/png")
	c.Header("Content-Disposition", "attachment; filename=qr-"+activity.Title+".png")
	c.Data(http.StatusOK, "image/png", png)
}
