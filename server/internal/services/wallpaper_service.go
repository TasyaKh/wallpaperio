package services

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

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
	Title      string
	ImageURL   string
	CategoryID uint
	Tags       []models.Tag
}

func (s *WallpaperService) CreateWallpaperFromURL(params CreateWallpaperParams) (*models.Wallpaper, error) {
	// Download image
	resp, err := http.Get(params.ImageURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download image: status code %d", resp.StatusCode)
	}

	// Create unique filename using timestamp and category
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%d.jpg", params.CategoryID, timestamp)
	filepath := filepath.Join(s.imagesDir, filename)

	fmt.Printf("Creating file: %s\n", filepath)

	// Create directory if it doesn't exist
	if err := os.MkdirAll(s.imagesDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create images directory: %w", err)
	}

	// Save image
	file, err := os.Create(filepath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	// Copy image data to file
	if _, err := io.Copy(file, resp.Body); err != nil {
		return nil, fmt.Errorf("failed to save image: %w", err)
	}

	// Create wallpaper record
	wallpaper := models.Wallpaper{
		Title:      params.Title,
		ImageURL:   filepath,
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
