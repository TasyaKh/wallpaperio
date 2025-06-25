package handlers

import (
	"fmt"
	"log"
	"net/http"

	"wallpaperio/server/internal/config"
	"wallpaperio/server/internal/domain/models"
	"wallpaperio/server/internal/domain/models/dto"
	"wallpaperio/server/internal/services"
	"wallpaperio/server/pkg/image_generator"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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
	var req dto.ImageCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.FailedResponseImageStatus{
			Status: "failed",
			Error:  "Invalid request body",
		})
		return
	}

	// Check category
	var category models.Category
	if err := h.db.Where("name = ?", req.Category).First(&category).Error; err != nil {
		c.JSON(http.StatusBadRequest, dto.FailedResponseImageStatus{
			Status: "failed",
			Error:  "Category not found",
		})
		return
	}

	// Call image generator service
	genReq := &image_generator.GenerateRequest{
		Prompt:         req.Prompt,
		NegativePrompt: req.NegativePrompt,
		Width:          req.Width,
		Height:         req.Height,
		GeneratorType:  req.GeneratorType,
	}

	genResp, err := h.client.GenerateImageAI(genReq)
	fmt.Println("Generated image response ", genResp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.FailedResponseImageStatus{
			Status: "failed",
			Error:  err.Error(),
		})
		return
	}

	// If we got a task ID, return pending response
	if genResp.TaskID != nil {
		c.JSON(http.StatusOK, dto.PendingResponseImage{
			Status: "pending",
			TaskID: *genResp.TaskID,
		})
		return
	}

	// If we got neither task ID nor saved path, return error
	c.JSON(http.StatusBadRequest, dto.FailedResponseImageStatus{
		Status: "failed",
		Error:  "No task ID or saved path received",
	})
}

func (h *ImageHandler) GetGenerationStatus(c *gin.Context) {
	log.Printf("GetGenerationStatus called with task_id: %s", c.Param("task_id"))
	taskID := c.Param("task_id")
	if taskID == "" {
		log.Printf("Task ID is empty")
		c.JSON(http.StatusBadRequest, dto.FailedResponseImageStatus{
			Status: "failed",
			Error:  "Task ID is required",
		})
		return
	}

	taskStatus, err := h.client.GetTaskStatus(taskID)
	if err != nil {
		log.Printf("Error getting task status: %v", err)
		c.JSON(http.StatusInternalServerError, dto.FailedResponseImageStatus{
			Status: "failed",
			Error:  err.Error(),
		})
		return
	}

	if taskStatus.Status == "completed" {
		c.JSON(http.StatusOK, dto.CompletedResponseImage{
			Status:       "completed",
			UrlPath:      taskStatus.UrlPath,
			UrlPathThumb: taskStatus.UrlPathThumb,
		})
		return
	}

	// For pending or failed status, return as is
	log.Printf("Task status: %s", taskStatus.Status)
	c.JSON(http.StatusOK, taskStatus)
}

func (h *ImageHandler) GetAvailableGenerators(c *gin.Context) {
	generators, err := h.client.GetAvailableGenerators()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.FailedResponseImageStatus{
			Status: "failed",
			Error:  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, generators)
}
