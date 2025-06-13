package models

import "time"

type Category struct {
	ID         uint        `json:"id" gorm:"primaryKey"`
	Name       string      `json:"name" gorm:"uniqueIndex"`
	ImageURL   string      `json:"image_url"`
	Wallpapers []Wallpaper `json:"wallpapers" gorm:"foreignKey:CategoryID"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
}
