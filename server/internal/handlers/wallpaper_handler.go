package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"wallpaperio/server/internal/services"

	"github.com/gin-gonic/gin"
)

type WallpaperHandler struct {
	wallpaperSvc *services.WallpaperService
	hostURL      string
}

func NewWallpaperHandler(wallpaperSvc *services.WallpaperService, hostURL string) *WallpaperHandler {
	return &WallpaperHandler{
		wallpaperSvc: wallpaperSvc,
		hostURL:      hostURL,
	}
}

// GetWallpapers handles GET /api/wallpapers
func (h *WallpaperHandler) GetWallpapers(c *gin.Context) {
	// Get query parameters
	tags := c.QueryArray("tags")
	category := c.Query("category")

	// Get pagination parameters with defaults
	limit := 20
	offset := 0
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	// Get wallpapers with filters and pagination
	result, err := h.wallpaperSvc.GetWallpapers(services.WallpaperFilter{
		Tags:     tags,
		Category: category,
		Limit:    limit,
		Offset:   offset,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch wallpapers"})
		return
	}

	// Add host URL to image paths
	for i := range result.Wallpapers {
		// Convert from "images/filename.jpg" to "static/images/filename.jpg"
		imagePath := result.Wallpapers[i].ImageURL
		if len(imagePath) > 7 && imagePath[:7] == "images/" {
			imagePath = "static/" + imagePath
		}
		result.Wallpapers[i].ImageURL = fmt.Sprintf("%s/%s", h.hostURL, imagePath)
	}

	c.JSON(http.StatusOK, gin.H{
		"wallpapers": result.Wallpapers,
		"total":      result.Total,
		"limit":      limit,
		"offset":     offset,
	})
}
