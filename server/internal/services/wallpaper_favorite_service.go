package services

import (
	"wallpaperio/server/internal/domain/models"

	"gorm.io/gorm"
)

type WallpaperFavoriteService struct {
	db *gorm.DB
}

func NewWallpaperFavoriteService(db *gorm.DB) *WallpaperFavoriteService {
	return &WallpaperFavoriteService{db: db}
}

func (s *WallpaperFavoriteService) AddFavorite(userID, wallpaperID uint) error {
	var count int64
	s.db.Model(&models.WallpaperFavorite{}).
		Where("user_id = ? AND wallpaper_id = ?", userID, wallpaperID).
		Count(&count)
	if count > 0 {
		return nil // Already favorited, do nothing or return a custom error
	}
	return s.db.Create(&models.WallpaperFavorite{
		UserID:      userID,
		WallpaperID: wallpaperID,
	}).Error
}

func (s *WallpaperFavoriteService) RemoveFavorite(userID, wallpaperID uint) error {
	return s.db.Where("user_id = ? AND wallpaper_id = ?", userID, wallpaperID).Delete(&models.WallpaperFavorite{}).Error
}

func (s *WallpaperFavoriteService) GetFavorites(userID uint, limit, offset int) ([]models.Wallpaper, int64, error) {
	// Get total count
	var total int64
	err := s.db.Model(&models.Wallpaper{}).
		Joins("JOIN wallpaper_favorites ON wallpapers.id = wallpaper_favorites.wallpaper_id").
		Where("wallpaper_favorites.user_id = ?", userID).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	var wallpapers []models.Wallpaper
	query := s.db.Joins("JOIN wallpaper_favorites ON wallpapers.id = wallpaper_favorites.wallpaper_id").
		Where("wallpaper_favorites.user_id = ?", userID).
		Order("wallpaper_favorites.id DESC").
		Preload("Tags").
		Preload("Category")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err = query.Find(&wallpapers).Error
	return wallpapers, total, err
}
