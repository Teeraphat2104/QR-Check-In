package handlers

import (
	"net/http"
	"time"

	"qr-check-in/internal/config"
	"qr-check-in/internal/database"
	"qr-check-in/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type StudentRegisterInput struct {
	StudentID string `json:"student_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
	Email     string `json:"email"`
	Password  string `json:"password" binding:"required,min=6"`
	Faculty   string `json:"faculty"`
	Major     string `json:"major"`
	Year      int    `json:"year"`
}

type StudentLoginInput struct {
	StudentID string `json:"student_id" binding:"required"`
	Password  string `json:"password" binding:"required"`
}

type StudentAuthHandler struct {
	cfg *config.Config
}

func NewStudentAuthHandler(cfg *config.Config) *StudentAuthHandler {
	return &StudentAuthHandler{cfg: cfg}
}

func (h *StudentAuthHandler) Register(c *gin.Context) {
	var input StudentRegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	var existing models.Student
	if err := database.DB.Where("student_id = ?", input.StudentID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "student_id already registered",
		})
		return
	}

	if input.Email != "" {
		if err := database.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "email already registered",
			})
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to process password",
		})
		return
	}

	student := models.Student{
		StudentID:    input.StudentID,
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		Faculty:      input.Faculty,
		Major:        input.Major,
		Year:         input.Year,
	}

	if err := database.DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to create student",
		})
		return
	}

	token, err := h.generateToken(student.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to generate token",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "registration successful",
		"data": gin.H{
			"student": student,
			"token":   token,
		},
	})
}

func (h *StudentAuthHandler) Login(c *gin.Context) {
	var input StudentLoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	var student models.Student
	if err := database.DB.Where("student_id = ?", input.StudentID).First(&student).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "invalid student_id or password",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(student.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "invalid student_id or password",
		})
		return
	}

	token, err := h.generateToken(student.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "login successful",
		"data": gin.H{
			"student": student,
			"token":   token,
		},
	})
}

func (h *StudentAuthHandler) GetProfile(c *gin.Context) {
	student, exists := c.Get("student")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "unauthorized",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": student,
	})
}

func (h *StudentAuthHandler) generateToken(studentID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"sub":  studentID.String(),
		"role": "student",
		"exp":  time.Now().Add(72 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.cfg.SupabaseJWTSecret))
}
