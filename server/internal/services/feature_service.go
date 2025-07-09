package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type FeatureService struct {
	generatorURL string
}

var result struct {
	Features []float32 `json:"features"`
}

func NewFeatureService() *FeatureService {
	return &FeatureService{
		generatorURL: os.Getenv("GENERATOR_URL"),
	}
}

func (s *FeatureService) ExtractFeatures(imageURL string) ([]float32, error) {
	if s.generatorURL == "" {
		return nil, fmt.Errorf("GENERATOR_URL environment variable not set")
	}

	body := fmt.Sprintf(`{"image_path": "%s"}`, imageURL)
	resp, err := http.Post(
		fmt.Sprintf("%s/api/images/extract-features", s.generatorURL),
		"application/json",
		strings.NewReader(body),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to call feature extractor: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("feature extractor returned error: %s", string(body))
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode feature extractor response: %w", err)
	}

	return result.Features, nil
}
