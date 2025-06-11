package utils

import (
	"fmt"
	"os"
)

// GetImagePath joins the host URL and image path, ensuring proper URL formatting
func GetImagePath(imagePath string) string {
	hostURL := os.Getenv("GENERATOR_URL")
	return fmt.Sprintf("%s/%s", hostURL, imagePath)
}
