package services

import (
	"fmt"

	"wallpaperio/server/internal/domain/models"

	"gorm.io/gorm"
)

type WallpaperService struct {
	db        *gorm.DB
	imagesDir string
}

func NewWallpaperService(db *gorm.DB, imagesDir string) *WallpaperService {
	return &WallpaperService{
		db:        db,
		imagesDir: imagesDir,
	}
}

type CreateWallpaperParams struct {
	Title        string
	ImageURL     string
	ThumbnailURL string
	CategoryID   uint
	Tags         []models.Tag
}

func (s *WallpaperService) CreateWallpaper(params CreateWallpaperParams) (*models.Wallpaper, error) {
	// Create wallpaper record
	wallpaper := models.Wallpaper{
		Title:      params.Title,
		ImageURL:   params.ImageURL,
		CategoryID: params.CategoryID,
	}

	if err := s.db.Create(&wallpaper).Error; err != nil {
		return nil, fmt.Errorf("failed to create wallpaper record: %w", err)
	}

	// Create wallpaper tags
	for _, tag := range params.Tags {
		wallpaperTag := models.WallpaperTag{
			WallpaperID: wallpaper.ID,
			TagID:       tag.ID,
		}
		if err := s.db.Create(&wallpaperTag).Error; err != nil {
			return nil, fmt.Errorf("failed to create wallpaper tag: %w", err)
		}
	}

	return &wallpaper, nil
}

// GetWallpapersByTags returns wallpapers that have all the specified tags
func (s *WallpaperService) GetWallpapersByTags(tags []string) ([]models.Wallpaper, error) {
	var wallpapers []models.Wallpaper
	query := s.db.Model(&models.Wallpaper{}).
		Joins("JOIN wallpaper_tags ON wallpaper_tags.wallpaper_id = wallpapers.id").
		Joins("JOIN tags ON tags.id = wallpaper_tags.tag_id").
		Where("tags.name IN ?", tags).
		Group("wallpapers.id").
		Having("COUNT(DISTINCT tags.id) = ?", len(tags)).
		Preload("Tags").
		Preload("Category")

	err := query.Find(&wallpapers).Error
	return wallpapers, err
}

// GetWallpapersByCategory returns wallpapers in the specified category
func (s *WallpaperService) GetWallpapersByCategory(categoryName string) ([]models.Wallpaper, error) {
	var wallpapers []models.Wallpaper
	err := s.db.Model(&models.Wallpaper{}).
		Joins("JOIN categories ON categories.id = wallpapers.category_id").
		Where("categories.name = ?", categoryName).
		Preload("Tags").
		Preload("Category").
		Find(&wallpapers).Error
	return wallpapers, err
}

// GetAllWallpapers returns all wallpapers with their tags and categories
func (s *WallpaperService) GetAllWallpapers() ([]models.Wallpaper, error) {
	var wallpapers []models.Wallpaper
	err := s.db.Preload("Tags").Preload("Category").Find(&wallpapers).Error
	return wallpapers, err
}

type WallpaperFilter struct {
	Tags     []string
	Category string
	Limit    int
	Offset   int
}

type WallpaperResult struct {
	Wallpapers []models.Wallpaper
	Total      int64
}

// GetWallpapers returns wallpapers with optional filters and pagination
func (s *WallpaperService) GetWallpapers(filter WallpaperFilter) (*WallpaperResult, error) {
	query := s.db.Model(&models.Wallpaper{})

	// Apply filters if provided
	if len(filter.Tags) > 0 {
		query = query.
			Joins("JOIN wallpaper_tags ON wallpaper_tags.wallpaper_id = wallpapers.id").
			Joins("JOIN tags ON tags.id = wallpaper_tags.tag_id").
			Where("tags.name IN ?", filter.Tags).
			Group("wallpapers.id").
			Having("COUNT(DISTINCT tags.id) = ?", len(filter.Tags))
	}

	if filter.Category != "" {
		query = query.
			Joins("JOIN categories ON categories.id = wallpapers.category_id").
			Where("categories.name = ?", filter.Category)
	}

	// Get total count
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, err
	}

	// Apply pagination and get results
	var wallpapers []models.Wallpaper
	err := query.
		Preload("Tags").
		Preload("Category").
		Limit(filter.Limit).
		Offset(filter.Offset).
		Find(&wallpapers).Error

	if err != nil {
		return nil, err
	}

	return &WallpaperResult{
		Wallpapers: wallpapers,
		Total:      total,
	}, nil
}

// DeleteWallpaper deletes a wallpaper by ID
func (s *WallpaperService) DeleteWallpaper(id uint) error {
	// First delete associated wallpaper tags
	if err := s.db.Where("wallpaper_id = ?", id).Delete(&models.WallpaperTag{}).Error; err != nil {
		return fmt.Errorf("failed to delete wallpaper tags: %w", err)
	}

	// Then delete the wallpaper
	if err := s.db.Delete(&models.Wallpaper{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete wallpaper: %w", err)
	}

	return nil
}

// GetNextWallpaper returns the next wallpaper in the same category
func (s *WallpaperService) GetNextWallpaper(currentID uint) (*models.Wallpaper, error) {
	var currentWallpaper models.Wallpaper
	if err := s.db.First(&currentWallpaper, currentID).Error; err != nil {
		return nil, fmt.Errorf("current wallpaper not found: %w", err)
	}

	var nextWallpaper models.Wallpaper
	err := s.db.Where("id > ? AND category_id = ?", currentID, currentWallpaper.CategoryID).
		Order("id ASC").
		Preload("Tags").
		Preload("Category").
		First(&nextWallpaper).Error
	if err != nil {
		return nil, fmt.Errorf("no next wallpaper found: %w", err)
	}
	return &nextWallpaper, nil
}

// GetPreviousWallpaper returns the previous wallpaper in the same category
func (s *WallpaperService) GetPreviousWallpaper(currentID uint) (*models.Wallpaper, error) {
	var currentWallpaper models.Wallpaper
	if err := s.db.First(&currentWallpaper, currentID).Error; err != nil {
		return nil, fmt.Errorf("current wallpaper not found: %w", err)
	}

	var prevWallpaper models.Wallpaper
	err := s.db.Where("id < ? AND category_id = ?", currentID, currentWallpaper.CategoryID).
		Order("id DESC").
		Preload("Tags").
		Preload("Category").
		First(&prevWallpaper).Error
	if err != nil {
		return nil, fmt.Errorf("no previous wallpaper found: %w", err)
	}
	return &prevWallpaper, nil
}

// GetSimilarWallpapers returns wallpapers from the same category with similar tags
func (s *WallpaperService) GetSimilarWallpapers(currentID uint, limit int) ([]models.Wallpaper, error) {
	var currentWallpaper models.Wallpaper
	if err := s.db.Preload("Tags").First(&currentWallpaper, currentID).Error; err != nil {
		return nil, fmt.Errorf("current wallpaper not found: %w", err)
	}

	// Get tag IDs from current wallpaper
	tagIDs := make([]uint, len(currentWallpaper.Tags))
	for i, tag := range currentWallpaper.Tags {
		tagIDs[i] = tag.ID
	}

	// Query similar wallpapers
	var similarWallpapers []models.Wallpaper
	query := s.db.Model(&models.Wallpaper{}).
		Joins("JOIN wallpaper_tags ON wallpaper_tags.wallpaper_id = wallpapers.id").
		Where("wallpapers.id != ? AND wallpapers.category_id = ?", currentID, currentWallpaper.CategoryID).
		Where("wallpaper_tags.tag_id IN ?", tagIDs).
		Group("wallpapers.id").
		Order("COUNT(wallpaper_tags.tag_id) DESC").
		Preload("Tags").
		Preload("Category").
		Limit(limit)

	err := query.Find(&similarWallpapers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to fetch similar wallpapers: %w", err)
	}

	return similarWallpapers, nil
}
