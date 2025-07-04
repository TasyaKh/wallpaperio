package dto

import (
	"wallpaperio/server/internal/domain/models"
)

type Direction string

const (
	DirectionNext     Direction = "next"
	DirectionPrevious Direction = "previous"
)

type CreateWallpaper struct {
	ImageURL       string   `json:"image_url"`
	ImageThumbUrl  string   `json:"image_thumb_url"`
	ImageMediumUrl *string  `json:"image_medium_url,omitempty"`
	Category       string   `json:"category"`
	Tags           []string `json:"tags"`
}

type WallpaperFilter struct {
	Tags     []string
	Category string
	Search   string
	Limit    int
	Offset   int
}

type NextPreviousWallpaperFilter struct {
	Category  string
	Search    string
	CurrentID uint64
}

type WallpaperResult struct {
	Wallpapers []models.Wallpaper
	Total      int64
}
