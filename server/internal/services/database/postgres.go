package database

import (
	"fmt"
	"log"

	"wallpaperio/server/internal/config"
	"wallpaperio/server/internal/domain/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type PostgresDB struct {
	*gorm.DB
}

func NewPostgresDB(cfg *config.DatabaseConfig) (*PostgresDB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto migrate the schema
	if err := db.AutoMigrate(
		&models.User{},
		&models.Wallpaper{},
		&models.WallpaperTag{},
		&models.WallpaperFavorite{},
		&models.Category{},
		&models.Tag{},
	); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %v", err)
	}

	log.Println("Successfully migrated database schema")
	return &PostgresDB{DB: db}, nil
}

func NewPostgresDBFromExisting(db *gorm.DB) *PostgresDB {
	return &PostgresDB{DB: db}
}
