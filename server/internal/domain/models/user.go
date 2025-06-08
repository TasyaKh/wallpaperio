package models

import "time"

type User struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Email         string    `json:"email" gorm:"uniqueIndex"`
	Name          string    `json:"name"`
	AuthType      string    `gorm:"not null"`
	AuthID        string    `gorm:"index"` // ID from auth provider
	ProfilePicURL string    `json:"profile_pic_url"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
