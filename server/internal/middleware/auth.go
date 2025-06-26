package middleware

import (
	"net/http"
	"strings"

	"wallpaperio/server/pkg/auth"

	"github.com/gin-gonic/gin"
)

func RequireAdmin(jwtService *auth.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		token = strings.TrimPrefix(token, "Bearer ")

		claims, err := jwtService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if claims.Role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func RequireAdminOrAPIKey(jwtService *auth.JWTService, apiKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check for Bearer token first
		bearerToken := c.GetHeader("Authorization")
		if strings.HasPrefix(bearerToken, "Bearer ") {
			token := strings.TrimPrefix(bearerToken, "Bearer ")
			claims, err := jwtService.ValidateToken(token)
			if err == nil && claims.Role == "admin" {
				c.Next()
				return
			}
		}

		// If no valid Bearer token, check for API key
		providedAPIKey := c.GetHeader("X-API-Key")
		if providedAPIKey != "" && providedAPIKey == apiKey {
			c.Next()
			return
		}

		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
	}
}
