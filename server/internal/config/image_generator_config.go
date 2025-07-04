package config

import (
	"os"
	"path/filepath"
)

type ImageGeneratorConfig struct {
	URL       string
	ImagesDir string
	BaseURL   string
}

func LoadImageGeneratorConfig() *ImageGeneratorConfig {
	generatorURL := os.Getenv("GENERATOR_URL")
	baseURL := os.Getenv("GENERATOR_URL")
	imagesDir := filepath.Join("static", "images")

	return &ImageGeneratorConfig{
		URL:       generatorURL,
		ImagesDir: imagesDir,
		BaseURL:   baseURL,
	}
}
