package services

import (
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

func (s *CategoryService) GetAllCategories() ([]models.Category, error) {
	var categories []models.Category
	err := s.db.Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return categories, nil
}
