package models

import (
	"time"
)

type Wallpaper struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	CategoryID  uint      `json:"category_id"`
	FeatureID   int64     `json:"feature_id" gorm:"index"`
	Category    Category  `json:"category" gorm:"foreignKey:CategoryID"`
	Tags        []Tag     `json:"tags" gorm:"many2many:wallpaper_tags;"`
	Downloads   int       `json:"downloads"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
