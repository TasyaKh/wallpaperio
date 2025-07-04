package models

import (
	"time"
)

type Wallpaper struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	ImageURL       string    `json:"image_url"`
	ImageThumbURL  string    `json:"image_thumb_url"`
	ImageMediumURL *string   `json:"image_medium_url,omitempty"`
	CategoryID     uint      `json:"category_id"`
	FeatureID      int64     `json:"feature_id" gorm:"index"`
	Category       Category  `json:"category" gorm:"foreignKey:CategoryID"`
	Tags           []Tag     `json:"tags" gorm:"many2many:wallpaper_tags;"`
	Downloads      int       `json:"downloads"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
