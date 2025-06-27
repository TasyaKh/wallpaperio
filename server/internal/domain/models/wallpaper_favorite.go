package models

import (
	"time"
)

type WallpaperFavorite struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"index;uniqueIndex:idx_user_wallpaper"`
	WallpaperID uint      `json:"wallpaper_id" gorm:"index;uniqueIndex:idx_user_wallpaper"`
	Wallpaper   Wallpaper `json:"wallpaper" gorm:"foreignKey:WallpaperID"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}
