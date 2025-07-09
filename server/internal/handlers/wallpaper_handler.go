package handlers

import (
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"

	"wallpaperio/server/internal/domain/models"
	"wallpaperio/server/internal/domain/models/dto"
	"wallpaperio/server/internal/services"
	"wallpaperio/server/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WallpaperHandler struct {
	wallpaperSvc *services.WallpaperService
	featuresSvc  *services.FeatureService
	tagSvc       *services.TagService
	db           *gorm.DB
	favoriteSvc  *services.WallpaperFavoriteService
}

type SimilarWallpapersResponse struct {
	Data       []models.Wallpaper `json:"data"`
	TotalCount int64              `json:"total_count"`
}

func NewWallpaperHandler(wallpaperSvc *services.WallpaperService, featuresSvc *services.FeatureService, tagSvc *services.TagService, db *gorm.DB) *WallpaperHandler {
	favoriteSvc := services.NewWallpaperFavoriteService(db)
	return &WallpaperHandler{
		wallpaperSvc: wallpaperSvc,
		featuresSvc:  featuresSvc,
		tagSvc:       tagSvc,
		db:           db,
		favoriteSvc:  favoriteSvc,
	}
}

func (h *WallpaperHandler) GetWallpapers(c *gin.Context) {
	tags := c.QueryArray("tags")
	category := c.Query("category")
	search := c.Query("search")

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
		Search:   search,
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

func (h *WallpaperHandler) InitSimilarSearch(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file is required (field: image)"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open uploaded file"})
		return
	}
	defer src.Close()

	fileBytes, err := io.ReadAll(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read uploaded file"})
		return
	}

	// Extract features, find similar, save in Redis, get key
	key, err := h.wallpaperSvc.InitSimilarSearch(fileBytes, c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, key)
}

func (h *WallpaperHandler) GetSimilarWallpapersByUserImg(c *gin.Context) {
	var req dto.GetSimilarWallpapersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request parameters"})
		return
	}
	if req.Key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Key redis is required"})
		return
	}
	offset64 := int64(req.Offset)

	cachedFeatures, err := h.wallpaperSvc.FindCachedFeatures(req.Key, c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	wallpapers, err := h.wallpaperSvc.GetSimilarWallpapers(&dto.FindSimilarWallpapers{
		Features: cachedFeatures,
		Limit:    req.Limit,
		Offset:   &offset64,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, wallpapers)
}

func (h *WallpaperHandler) GetSimilarWallpapersByCurrId(c *gin.Context) {
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

	wallpapers, err := h.wallpaperSvc.GetSimilarWallpapersByCurrId(uint(id), limit)
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

// favorites

func (h *WallpaperHandler) AddFavorite(c *gin.Context) {
	user := utils.CurrentUser(c)
	wallpaperID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallpaper ID"})
		return
	}
	if err := h.favoriteSvc.AddFavorite(user.UserID, uint(wallpaperID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add favorite"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *WallpaperHandler) RemoveFavorite(c *gin.Context) {
	user := utils.CurrentUser(c)

	wallpaperID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallpaper ID"})
		return
	}
	if err := h.favoriteSvc.RemoveFavorite(user.UserID, uint(wallpaperID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove favorite"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *WallpaperHandler) GetFavorites(c *gin.Context) {
	user := utils.CurrentUser(c)

	// Parse pagination parameters
	limit := 20 // Default limit
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

	wallpapers, total, err := h.favoriteSvc.GetFavorites(user.UserID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"wallpapers": wallpapers,
		"total":      total,
		"limit":      limit,
		"offset":     offset,
	})
}

func (h *WallpaperHandler) GetWallpaperInfo(c *gin.Context) {
	user := utils.CurrentUser(c)
	wallpaperID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallpaper ID"})
		return
	}

	wallpaper, err := h.wallpaperSvc.GetWallpaperByID(uint(wallpaperID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wallpaper not found"})
		return
	}

	isFavorite := false
	if user != nil {
		var fav models.WallpaperFavorite
		if err := h.db.Where("user_id = ? AND wallpaper_id = ?", user.UserID, wallpaperID).First(&fav).Error; err == nil {
			isFavorite = true
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"wallpaper":   wallpaper,
		"is_favorite": isFavorite,
	})
}

func (h *WallpaperHandler) InstallWallpaper(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallpaper ID"})
		return
	}

	w, err := h.wallpaperSvc.GetWallpaperByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wallpaper not found"})
		return
	}

	go func() {
		if err2 := h.wallpaperSvc.IncrementDownloads(uint(id)); err2 != nil {
			fmt.Printf("failed to increment downloads: %v", err2)
		}
	}()
	resp, err := http.Get(w.ImageURL)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch image"})
		return
	}
	defer resp.Body.Close()

	name := filepath.Base(w.ImageURL)
	if name == "" {
		name = "wallpaper.jpg"
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", name))
	c.DataFromReader(http.StatusOK, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)
}
