package handlers

import (
	"net/http"

	"qr-check-in/internal/database"
	"qr-check-in/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func GetProfile(c *gin.Context) {
	admin, exists := c.Get("admin")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "unauthorized",
		})
		return
	}

	a := admin.(*models.Admin)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":    a.ID,
			"email": a.Email,
			"name":  a.Name,
		},
	})
}

func SyncAdmin(c *gin.Context) {
	claims, _ := c.Get("supabase_claims")
	mapClaims, ok := claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "invalid claims",
		})
		return
	}

	sub, _ := mapClaims["sub"].(string)
	email, _ := mapClaims["email"].(string)

	var admin models.Admin
	result := database.DB.Where("supabase_uid = ?", sub).First(&admin)
	if result.Error != nil {
		admin = models.Admin{
			SupabaseUID: sub,
			Email:       email,
			Name:        email,
		}
		if err := database.DB.Create(&admin).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "failed to sync admin",
			})
			return
		}
	} else {
		updates := map[string]interface{}{}
		if email != "" && email != admin.Email {
			updates["email"] = email
		}
		if len(updates) > 0 {
			database.DB.Model(&admin).Updates(updates)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":    admin.ID,
			"email": admin.Email,
			"name":  admin.Name,
		},
	})
}
