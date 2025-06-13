package dto

import (
	"wallpaperio/server/internal/domain/models"
)

type CreateWallpaper struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	ImageURL    string   `json:"image_url"`
	Category    string   `json:"category"`
	Tags        []string `json:"tags"`
}

type WallpaperFilter struct {
	Tags     []string
	Category string
	Limit    int
	Offset   int
}

type NextPreviousWallpaperFilter struct {
	Category  string
	CurrentID uint64
}

type WallpaperResult struct {
	Wallpapers []models.Wallpaper
	Total      int64
}
