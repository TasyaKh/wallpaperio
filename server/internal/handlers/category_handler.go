package handlers

import (
	"net/http"

	"wallpaperio/server/internal/services"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categorySvc *services.CategoryService
}

func NewCategoryHandler(categorySvc *services.CategoryService) *CategoryHandler {
	return &CategoryHandler{
		categorySvc: categorySvc,
	}
}

func (h *CategoryHandler) GetAllCategories(c *gin.Context) {
	categories, err := h.categorySvc.GetAllCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, categories)
}
