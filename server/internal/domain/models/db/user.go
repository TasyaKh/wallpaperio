package models

import (
	"time"

	"wallpaperio/server/internal/domain/models"
)

type User struct {
	ID            uint            `json:"id" gorm:"primaryKey"`
	Email         string          `json:"email" gorm:"uniqueIndex"`
	Name          string          `json:"name"`
	AuthType      string          `gorm:"not null"`
	AuthID        string          `gorm:"index"` // ID from auth provider
	ProfilePicURL string          `json:"profile_pic_url"`
	Role          models.UserRole `json:"role" gorm:"type:varchar(20);default:'user'"` // Using UserRole type
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}
