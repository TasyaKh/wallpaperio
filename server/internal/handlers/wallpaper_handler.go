package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"wallpaperio/server/internal/domain/models"
	"wallpaperio/server/internal/domain/models/dto"
	"wallpaperio/server/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WallpaperHandler struct {
	wallpaperSvc *services.WallpaperService
	tagSvc       *services.TagService
	db           *gorm.DB
}

type SimilarWallpapersResponse struct {
	Data       []models.Wallpaper `json:"data"`
	TotalCount int64              `json:"total_count"`
}

func NewWallpaperHandler(wallpaperSvc *services.WallpaperService, tagSvc *services.TagService, db *gorm.DB) *WallpaperHandler {
	return &WallpaperHandler{
		wallpaperSvc: wallpaperSvc,
		tagSvc:       tagSvc,
		db:           db,
	}
}

func (h *WallpaperHandler) GetWallpapers(c *gin.Context) {
	tags := c.QueryArray("tags")
	category := c.Query("category")

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
	result, err := h.wallpaperSvc.GetWallpapers(dto.WallpaperFilter{
		Tags:     tags,
		Category: category,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch wallpapers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"wallpapers": result.Wallpapers,
		"total":      result.Total,
		"limit":      limit,
		"offset":     offset,
	})
}

func (h *WallpaperHandler) DeleteWallpaper(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallpaper ID"})
		return
	}

	if err := h.wallpaperSvc.DeleteWallpaper(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete wallpaper %v", err)})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *WallpaperHandler) GetNextWallpaper(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallpaper ID"})
		return
	}

	category := c.Query("category")

	filter := dto.NextPreviousWallpaperFilter{
		Category:  category,
		CurrentID: id,
	}

	wallpaper, err := h.wallpaperSvc.GetNextWallpaper(filter)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No next wallpaper found"})
		return
	}

	c.JSON(http.StatusOK, wallpaper)
}

func (h *WallpaperHandler) GetPreviousWallpaper(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallpaper ID"})
		return
	}

	// Get category from query parameter
	category := c.Query("category")

	filter := dto.NextPreviousWallpaperFilter{
		Category:  category,
		CurrentID: id,
	}

	wallpaper, err := h.wallpaperSvc.GetPreviousWallpaper(filter)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No previous wallpaper found"})
		return
	}

	c.JSON(http.StatusOK, wallpaper)
}

func (h *WallpaperHandler) GetSimilarWallpapers(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallpaper ID"})
		return
	}

	limit := 150 // Default limit
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	wallpapers, err := h.wallpaperSvc.GetSimilarWallpapers(uint(id), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch similar wallpapers: %v", err)})
		return
	}

	c.JSON(http.StatusOK, wallpapers)
}

func (h *WallpaperHandler) CreateWallpaper(c *gin.Context) {
	var req dto.CreateWallpaper
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	// Create wallpaper
	wallpaper, err := h.wallpaperSvc.CreateWallpaper(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create wallpaper: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, wallpaper)
}
