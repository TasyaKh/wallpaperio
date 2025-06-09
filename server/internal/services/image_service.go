package services

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	ThumbnailWidth   = 300
	ThumbnailHeight  = 169 // 16:9 aspect ratio
	ThumbnailQuality = 80
)

type ImageService struct {
	db        *gorm.DB
	imagesDir string
}

func NewImageService(db *gorm.DB, imagesDir string) *ImageService {
	return &ImageService{
		db:        db,
		imagesDir: imagesDir,
	}
}

func decodeImageWithTimeout(reader io.Reader) (image.Image, string, error) {
	decodeDone := make(chan error, 1)
	var img image.Image
	var format string

	go func() {
		var decodeErr error
		img, format, decodeErr = image.Decode(reader)
		decodeDone <- decodeErr
	}()

	select {
	case err := <-decodeDone:
		if err != nil {
			return nil, "", fmt.Errorf("failed to decode image: %w", err)
		}
	case <-time.After(20 * time.Second):
		return nil, "", fmt.Errorf("image decoding timed out after 20 seconds")
	}

	return img, format, nil
}

// downloadImage downloads an image from a URL and returns the response
func (s *ImageService) downloadImage(imageURL string) (*http.Response, error) {
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	resp, err := client.Get(imageURL)
	if err != nil {
		return nil, fmt.Errorf("failed to download image: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("failed to download image: status code %d", resp.StatusCode)
	}

	return resp, nil
}

// validateImageFormat checks if the image format is supported
func validateImageFormat(header []byte) error {
	contentType := http.DetectContentType(header)
	if contentType != "image/jpeg" && contentType != "image/png" {
		return fmt.Errorf("invalid image format: %s", contentType)
	}
	return nil
}

// saveImage saves an image to disk with the specified format and quality
func (s *ImageService) saveImage(img image.Image, path string, format string, quality int) error {
	file, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("failed to create image file: %w", err)
	}
	defer file.Close()

	switch format {
	case "jpeg", "jpg":
		if err := jpeg.Encode(file, img, &jpeg.Options{Quality: quality}); err != nil {
			os.Remove(path)
			return fmt.Errorf("failed to save JPEG image: %w", err)
		}
	case "png":
		if err := png.Encode(file, img); err != nil {
			os.Remove(path)
			return fmt.Errorf("failed to save PNG image: %w", err)
		}
	default:
		return fmt.Errorf("unsupported image format: %s", format)
	}

	// Verify the saved file
	if fileInfo, err := file.Stat(); err != nil || fileInfo.Size() == 0 {
		os.Remove(path)
		return fmt.Errorf("failed to save image: file is empty")
	}

	return nil
}

// generateThumbnail creates a thumbnail from the original image
func generateThumbnail(img image.Image) image.Image {
	return imaging.Resize(img, ThumbnailWidth, ThumbnailHeight, imaging.Lanczos)
}

// ProcessImage handles the entire image processing pipeline
func (s *ImageService) ProcessImage(ctx context.Context, imageURL string) (string, string, error) {
	// Download image
	resp, err := s.downloadImage(imageURL)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	// Read and validate image header
	header := make([]byte, 512)
	n, err := resp.Body.Read(header)
	if err != nil && err != io.EOF {
		return "", "", fmt.Errorf("failed to read image header: %w", err)
	}

	if err := validateImageFormat(header[:n]); err != nil {
		return "", "", err
	}

	// Decode image
	bodyReader := io.MultiReader(bytes.NewReader(header[:n]), resp.Body)
	img, format, err := decodeImageWithTimeout(bodyReader)
	if err != nil {
		return "", "", err
	}

	// Validate image dimensions
	bounds := img.Bounds()
	if bounds.Dx() == 0 || bounds.Dy() == 0 {
		return "", "", fmt.Errorf("invalid image dimensions")
	}

	// Generate filenames
	baseFilename := uuid.New().String()
	originalFilename := baseFilename + "." + format
	thumbnailFilename := baseFilename + "_thumb." + format

	// Create images directory
	if err := os.MkdirAll(s.imagesDir, 0755); err != nil {
		return "", "", fmt.Errorf("failed to create images directory: %w", err)
	}

	// Save original image
	originalPath := filepath.Join(s.imagesDir, originalFilename)
	if err := s.saveImage(img, originalPath, format, 100); err != nil {
		return "", "", fmt.Errorf("failed to save original image: %w", err)
	}

	// Generate and save thumbnail
	thumbnail := generateThumbnail(img)
	thumbnailPath := filepath.Join(s.imagesDir, thumbnailFilename)
	if err := s.saveImage(thumbnail, thumbnailPath, format, ThumbnailQuality); err != nil {
		os.Remove(originalPath) // Clean up original on error
		return "", "", fmt.Errorf("failed to save thumbnail: %w", err)
	}

	// Return relative paths
	return originalPath, thumbnailPath, nil
}
