package handlers

import (
	"log"
	"net/http"

	"wallpaperio/server/internal/domain/models"
	"wallpaperio/server/pkg/auth"
	"wallpaperio/server/pkg/database"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	googleAuth *auth.GoogleAuth
	db         *database.PostgresDB
	jwtService *auth.JWTService
}

func NewAuthHandler(googleAuth *auth.GoogleAuth, db *database.PostgresDB, jwtService *auth.JWTService) *AuthHandler {
	return &AuthHandler{
		googleAuth: googleAuth,
		db:         db,
		jwtService: jwtService,
	}
}

func (h *AuthHandler) InitiateGoogleAuth(c *gin.Context) {
	url := h.googleAuth.GetAuthURL()
	log.Println("Google Auth URL:", url)
	c.JSON(http.StatusOK, gin.H{
		"auth_url": url,
	})
}

func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
		return
	}

	// Get user info from Google
	googleUser, err := h.googleAuth.GetUserInfo(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Find or create user in database
	var user models.User
	result := h.db.Where("auth_id = ? AND auth_type = ?", googleUser.ID, "google").First(&user)
	if result.Error != nil {
		// User doesn't exist, create new user
		user = models.User{
			Email:         googleUser.Email,
			Name:          googleUser.Name,
			ProfilePicURL: googleUser.Picture,
			AuthType:      "google",
			AuthID:        googleUser.ID,
		}
		if err := h.db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	}

	// Generate JWT token
	tokenString, err := h.jwtService.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":              user.ID,
			"email":           user.Email,
			"name":            user.Name,
			"profile_pic_url": user.ProfilePicURL,
			"auth_type":       user.AuthType,
			"auth_id":         user.AuthID,
			"created_at":      user.CreatedAt,
			"updated_at":      user.UpdatedAt,
		},
		"token": tokenString,
	})
}
