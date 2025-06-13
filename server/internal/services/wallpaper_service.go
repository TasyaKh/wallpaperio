package services

import (
	"fmt"

	"wallpaperio/server/internal/domain/models"
	"wallpaperio/server/internal/domain/models/dto"

	"gorm.io/gorm"
)

type WallpaperService struct {
	db            *gorm.DB
	tagSvc        *TagService
	featureSvc    *FeatureService
	milvusService *MilvusService
}

func NewWallpaperService(db *gorm.DB, tagSvc *TagService, featureSvc *FeatureService) (*WallpaperService, error) {
	milvusService, err := NewMilvusService()
	if err != nil {
		return nil, fmt.Errorf("failed to create Milvus service: %w", err)
	}

	return &WallpaperService{
		db:            db,
		tagSvc:        tagSvc,
		featureSvc:    featureSvc,
		milvusService: milvusService,
	}, nil
}

func (s *WallpaperService) CreateWallpaper(params dto.CreateWallpaper) (*models.Wallpaper, error) {
	// Get or create category
	var category models.Category
	if err := s.db.Where("name = ?", params.Category).FirstOrCreate(&category, models.Category{Name: params.Category}).Error; err != nil {
		return nil, fmt.Errorf("failed to process category: %w", err)
	}

	// Get or create tags
	tags, err := s.tagSvc.GetOrCreateTags(params.Tags)
	if err != nil {
		return nil, fmt.Errorf("failed to process tags: %w", err)
	}

	// Extract features from image
	features, err := s.featureSvc.ExtractFeatures(params.ImageURL)
	if err != nil {
		return nil, fmt.Errorf("failed to extract features: %w", err)
	}

	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}

	// Create wallpaper record
	wallpaper := &models.Wallpaper{
		Title:       params.Title,
		Description: params.Description,
		ImageURL:    params.ImageURL,
		CategoryID:  category.ID,
		Tags:        tags,
	}

	if err := tx.Create(wallpaper).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create wallpaper record: %w", err)
	}

	// Store features in Milvus and get feature ID
	featureID, err := s.milvusService.StoreFeatures(wallpaper.ID, features)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to store features in Milvus: %w", err)
	}

	// Update wallpaper with feature ID
	wallpaper.FeatureID = featureID
	if err := tx.Save(wallpaper).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to update wallpaper with feature ID: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return wallpaper, nil
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

// GetWallpapers returns wallpapers with optional filters and pagination
func (s *WallpaperService) GetWallpapers(filter dto.WallpaperFilter) (*dto.WallpaperResult, error) {
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
		Order("id DESC").
		Limit(filter.Limit).
		Offset(filter.Offset).
		Find(&wallpapers).Error
	if err != nil {
		return nil, err
	}

	return &dto.WallpaperResult{
		Wallpapers: wallpapers,
		Total:      total,
	}, nil
}

// DeleteWallpaper deletes a wallpaper and its features
func (s *WallpaperService) DeleteWallpaper(id uint) error {
	// Get wallpaper to get its feature ID
	var wallpaper models.Wallpaper
	if err := s.db.First(&wallpaper, id).Error; err != nil {
		return fmt.Errorf("failed to find wallpaper: %w", err)
	}

	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to start transaction: %w", tx.Error)
	}

	// Delete wallpaper from database
	if err := tx.Delete(&models.Wallpaper{}, id).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete wallpaper: %w", err)
	}

	// Delete features from Milvus using feature ID
	if err := s.milvusService.DeleteFeatures(uint(wallpaper.FeatureID)); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete features: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (s *WallpaperService) GetNextWallpaper(filter dto.NextPreviousWallpaperFilter) (*models.Wallpaper, error) {
	var currentWallpaper models.Wallpaper
	if err := s.db.First(&currentWallpaper, filter.CurrentID).Error; err != nil {
		return nil, fmt.Errorf("current wallpaper not found: %w", err)
	}

	query := s.db.Model(&models.Wallpaper{}).
		Where("wallpapers.id < ?", filter.CurrentID)

	if filter.Category != "" {
		query = query.
			Joins("JOIN categories ON categories.id = wallpapers.category_id").
			Where("categories.name = ?", filter.Category)
	}

	var nextWallpaper models.Wallpaper
	err := query.
		Order("wallpapers.id DESC").
		Preload("Category").
		First(&nextWallpaper).Error
	if err != nil {
		return nil, fmt.Errorf("no next wallpaper found: %w", err)
	}
	return &nextWallpaper, nil
}

func (s *WallpaperService) GetPreviousWallpaper(filter dto.NextPreviousWallpaperFilter) (*models.Wallpaper, error) {
	var currentWallpaper models.Wallpaper
	if err := s.db.First(&currentWallpaper, filter.CurrentID).Error; err != nil {
		return nil, fmt.Errorf("current wallpaper not found: %w", err)
	}

	query := s.db.Model(&models.Wallpaper{}).
		Where("wallpapers.id > ?", filter.CurrentID)

	if filter.Category != "" {
		query = query.
			Joins("JOIN categories ON categories.id = wallpapers.category_id").
			Where("categories.name = ?", filter.Category)
	}

	var prevWallpaper models.Wallpaper
	err := query.
		Order("wallpapers.id ASC").
		Preload("Category").
		First(&prevWallpaper).Error
	if err != nil {
		return nil, fmt.Errorf("no previous wallpaper found: %w", err)
	}
	return &prevWallpaper, nil
}

func (s *WallpaperService) GetSimilarWallpapers(currWalppaperId uint, limit int) ([]models.Wallpaper, error) {
	var currentWallpaper models.Wallpaper
	if err := s.db.First(&currentWallpaper, currWalppaperId).Error; err != nil {
		return nil, fmt.Errorf("failed to find wallpaper: %w", err)
	}

	features, err := s.milvusService.GetFeaturesOneWallpaper(uint(currentWallpaper.FeatureID))
	if err != nil {
		return nil, fmt.Errorf("failed to get features: %w", err)
	}

	similarIDs, err := s.milvusService.FindSimilar(features, limit, uint64(currentWallpaper.FeatureID))
	if err != nil {
		return nil, fmt.Errorf("failed to find similar wallpapers: %w", err)
	}

	var similarWallpapers []models.Wallpaper
	if err := s.db.Where("feature_id IN ?", similarIDs).Find(&similarWallpapers).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch similar wallpapers: %w", err)
	}

	return similarWallpapers, nil
}
