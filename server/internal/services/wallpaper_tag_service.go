package services

import (
	models "wallpaperio/server/internal/domain/models/db"

	"gorm.io/gorm"
)

type WallpaperTagService struct {
	db *gorm.DB
}

func NewWallpaperTagService(db *gorm.DB) *WallpaperTagService {
	return &WallpaperTagService{db: db}
}

// GetTagsForWallpaper returns all tags for a given wallpaper
func (s *WallpaperTagService) GetTagsForWallpaper(wallpaperID uint) ([]models.Tag, error) {
	var tags []models.Tag
	err := s.db.Joins("JOIN wallpaper_tags ON wallpaper_tags.tag_id = tags.id").
		Where("wallpaper_tags.wallpaper_id = ?", wallpaperID).
		Find(&tags).Error
	return tags, err
}

// AddTagToWallpaper adds a tag to a wallpaper
func (s *WallpaperTagService) AddTagToWallpaper(wallpaperID, tagID uint) error {
	wallpaperTag := models.WallpaperTag{
		WallpaperID: wallpaperID,
		TagID:       tagID,
	}
	return s.db.Create(&wallpaperTag).Error
}

// RemoveTagFromWallpaper removes a tag from a wallpaper
func (s *WallpaperTagService) RemoveTagFromWallpaper(wallpaperID, tagID uint) error {
	return s.db.Where("wallpaper_id = ? AND tag_id = ?", wallpaperID, tagID).
		Delete(&models.WallpaperTag{}).Error
}
