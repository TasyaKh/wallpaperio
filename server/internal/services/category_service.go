package services

import (
	"fmt"
	"wallpaperio/server/internal/domain/models"

	"gorm.io/gorm"
)

type CategoryService struct {
	db      *gorm.DB
	baseURL string
}

func NewCategoryService(db *gorm.DB, baseURL string) *CategoryService {
	return &CategoryService{
		db:      db,
		baseURL: baseURL,
	}
}

// GetAllCategories returns all categories
func (s *CategoryService) GetAllCategories() ([]models.Category, error) {
	var categories []models.Category
	err := s.db.Find(&categories).Error
	if err != nil {
		return nil, err
	}

	// Add base URL to image paths
	for i := range categories {
		if categories[i].ImageURL != "" {
			categories[i].ImageURL = fmt.Sprintf("%s/%s", s.baseURL, categories[i].ImageURL)
		}
	}

	return categories, nil
}
