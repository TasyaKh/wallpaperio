package models

import "time"

type Wallpaper struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	CategoryID  uint      `json:"category_id"`
	Category    Category  `json:"category" gorm:"foreignKey:CategoryID"`
	Tags        []Tag     `json:"tags" gorm:"many2many:wallpaper_tags;"`
	Downloads   int       `json:"downloads"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type Category struct {
	ID         uint        `json:"id" gorm:"primaryKey"`
	Name       string      `json:"name" gorm:"uniqueIndex"`
	ImageURL   string      `json:"image_url"`
	Wallpapers []Wallpaper `json:"wallpapers" gorm:"foreignKey:CategoryID"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
}

type Tag struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"uniqueIndex"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
