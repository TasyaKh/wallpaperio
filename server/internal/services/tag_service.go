package services

import (
	"wallpaperio/server/internal/domain/models"

	"gorm.io/gorm"
)

type TagService struct {
	db *gorm.DB
}

func NewTagService(db *gorm.DB) *TagService {
	return &TagService{db: db}
}

// GetOrCreateTags gets existing tags or creates new ones if they don't exist
func (s *TagService) GetOrCreateTags(tagNames []string) ([]models.Tag, error) {
	var tags []models.Tag
	for _, tagName := range tagNames {
		var tag models.Tag
		result := s.db.Where("name = ?", tagName).First(&tag)
		if result.Error != nil {
			// Create new tag if not exists
			tag = models.Tag{Name: tagName}
			if err := s.db.Create(&tag).Error; err != nil {
				return nil, err
			}
		}
		tags = append(tags, tag)
	}
	return tags, nil
}
