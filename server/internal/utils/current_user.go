package utils

import (
	"wallpaperio/server/internal/domain"

	"github.com/gin-gonic/gin"
)

func CurrentUser(c *gin.Context) *domain.Claims {
	claims, exists := c.Get("claims")
	if !exists {
		return nil
	}
	userClaims, ok := claims.(*domain.Claims)
	if !ok {
		return nil
	}
	return userClaims
}
