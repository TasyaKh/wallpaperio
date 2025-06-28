package models

type Category struct {
	ID         uint        `json:"id" gorm:"primaryKey"`
	Name       string      `json:"name" gorm:"uniqueIndex"`
	ImageURL   string      `json:"image_url"`
	Wallpapers []Wallpaper `json:"wallpapers" gorm:"foreignKey:CategoryID"`
}
