package handlers

import (
	"fmt"
	"log"
	"net/http"

	"wallpaperio/server/internal/config"
	"wallpaperio/server/internal/domain/models"
	"wallpaperio/server/internal/services"
	"wallpaperio/server/internal/utils"
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
	GeneratorType  *string  `json:"generator_type,omitempty"`
}

type ImageHandler struct {
	config *config.ImageGeneratorConfig
	client *image_generator.Client
	db     *gorm.DB
	tagSvc *services.TagService
}

func NewImageHandler(cfg *config.ImageGeneratorConfig, db *gorm.DB) *ImageHandler {
	return &ImageHandler{
		config: cfg,
		client: image_generator.NewClient(cfg.URL),
		db:     db,
		tagSvc: services.NewTagService(db),
	}
}

func (h *ImageHandler) GenerateImage(c *gin.Context) {
	var req ImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.FailedResponse{
			Status: "failed",
			Error:  "Invalid request body",
		})
		return
	}

	// Check category
	var category models.Category
	if err := h.db.Where("name = ?", req.Category).First(&category).Error; err != nil {
		c.JSON(http.StatusBadRequest, models.FailedResponse{
			Status: "failed",
			Error:  "Category not found",
		})
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
		GeneratorType:  req.GeneratorType,
	}

	genResp, err := h.client.GenerateImageAI(genReq)
	fmt.Println("Generated image response ", genResp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.FailedResponse{
			Status: "failed",
			Error:  err.Error(),
		})
		return
	}

	// If we got a task ID, return pending response
	if genResp.TaskID != nil {
		c.JSON(http.StatusOK, models.PendingResponse{
			Status: "pending",
			TaskID: *genResp.TaskID,
		})
		return
	}

	// If we got a direct response with saved path, return the image URL
	if genResp.SavedPathURL != "" {
		imageURL := utils.GetImagePath(genResp.SavedPathURL)
		c.JSON(http.StatusOK, models.CompletedResponse{
			Status:       "completed",
			SavedPathURL: imageURL,
		})
		return
	}

	// If we got neither task ID nor saved path, return error
	c.JSON(http.StatusBadRequest, models.FailedResponse{
		Status: "failed",
		Error:  "No task ID or saved path received",
	})
}

func (h *ImageHandler) GetGenerationStatus(c *gin.Context) {
	log.Printf("GetGenerationStatus called with task_id: %s", c.Param("task_id"))
	taskID := c.Param("task_id")
	if taskID == "" {
		log.Printf("Task ID is empty")
		c.JSON(http.StatusBadRequest, models.FailedResponse{
			Status: "failed",
			Error:  "Task ID is required",
		})
		return
	}

	status, err := h.client.GetTaskStatus(taskID)
	if err != nil {
		log.Printf("Error getting task status: %v", err)
		c.JSON(http.StatusInternalServerError, models.FailedResponse{
			Status: "failed",
			Error:  err.Error(),
		})
		return
	}

	// If the task is completed and we have a saved path, return the image URL
	if status.Status == "completed" && status.SavedPathURL != "" {
		imageServerURL := utils.GetImagePath(status.SavedPathURL)
		log.Printf("Task completed, returning image URL: %s", status.SavedPathURL)
		c.JSON(http.StatusOK, models.CompletedResponse{
			Status:        "completed",
			SavedPathURL:  status.SavedPathURL,
			ServerPathURL: imageServerURL,
		})
		return
	}

	// For pending or failed status, return as is
	log.Printf("Task status: %s", status.Status)
	c.JSON(http.StatusOK, status)
}

func (h *ImageHandler) GetAvailableGenerators(c *gin.Context) {
	generators, err := h.client.GetAvailableGenerators()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.FailedResponse{
			Status: "failed",
			Error:  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, generators)
}
