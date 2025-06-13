package models

import (
	"time"
)

type WallpaperTag struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	WallpaperID uint      `json:"wallpaper_id" gorm:"index;constraint:OnDelete:CASCADE"`
	TagID       uint      `json:"tag_id" gorm:"index;constraint:OnDelete:CASCADE"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
