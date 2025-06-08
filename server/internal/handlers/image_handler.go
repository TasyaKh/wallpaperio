package handlers

import (
	"net/http"

	"wallpaperio/server/internal/config"
	"wallpaperio/server/internal/domain/models"
	"wallpaperio/server/internal/services"
	"wallpaperio/server/pkg/image_generator"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ImageRequest struct {
	Prompt         string   `json:"prompt"`
	N              int      `json:"n"`
	NegativePrompt *string  `json:"negative_prompt,omitempty"`
	Width          int      `json:"width"`
	Height         int      `json:"height"`
	Steps          int      `json:"steps"`
	CfgScale       float64  `json:"cfg_scale"`
	Category       string   `json:"category"`
	Tags           []string `json:"tags"`
}

type ImageResponse struct {
	Images []string `json:"images"`
	Error  *string  `json:"error,omitempty"`
}

type ImageHandler struct {
	config       *config.ImageGeneratorConfig
	client       *image_generator.Client
	db           *gorm.DB
	wallpaperSvc *services.WallpaperService
	tagSvc       *services.TagService
}

func NewImageHandler(cfg *config.ImageGeneratorConfig, db *gorm.DB) *ImageHandler {
	return &ImageHandler{
		config:       cfg,
		client:       image_generator.NewClient(cfg.URL),
		db:           db,
		wallpaperSvc: services.NewWallpaperService(db, cfg.ImagesDir),
		tagSvc:       services.NewTagService(db),
	}
}

func (h *ImageHandler) GenerateImage(c *gin.Context) {

	var req ImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	// Validate category
	var category models.Category
	if err := h.db.Where("name = ?", req.Category).First(&category).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category not found"})
		return
	}

	// Get or create tags
	tags, err := h.tagSvc.GetOrCreateTags(req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process tags"})
		return
	}

	// Call image generator service
	genReq := &image_generator.GenerateRequest{
		Prompt:         req.Prompt,
		N:              req.N,
		NegativePrompt: req.NegativePrompt,
		Width:          req.Width,
		Height:         req.Height,
		Steps:          req.Steps,
		CfgScale:       req.CfgScale,
	}

	genResp, err := h.client.GenerateImages(genReq)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Create wallpapers from generated images
	var savedPaths []string
	for _, imageURL := range genResp.Images {
		wallpaper, err := h.wallpaperSvc.CreateWallpaperFromURL(services.CreateWallpaperParams{
			Title:      req.Prompt,
			ImageURL:   imageURL,
			CategoryID: category.ID,
			Tags:       tags,
		})

		if err != nil {
			continue
		}
		savedPaths = append(savedPaths, wallpaper.ImageURL)
	}

	// Return saved paths
	c.JSON(http.StatusOK, gin.H{
		"file_paths": savedPaths,
	})
}
