package services

import (
	"wallpaperio/server/internal/domain/models"

	"gorm.io/gorm"
)

type CategoryService struct {
	db *gorm.DB
}

func NewCategoryService(db *gorm.DB) *CategoryService {
	return &CategoryService{db: db}
}

// GetAllCategories returns all categories
func (s *CategoryService) GetAllCategories() ([]models.Category, error) {
	var categories []models.Category
	err := s.db.Find(&categories).Error
	return categories, err
}
