package image_generator

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type GenerateRequest struct {
	Prompt         string  `json:"prompt"`
	N              int     `json:"n"`
	NegativePrompt *string `json:"negative_prompt,omitempty"`
	Width          int     `json:"width"`
	Height         int     `json:"height"`
	Steps          int     `json:"steps"`
	CfgScale       float64 `json:"cfg_scale"`
}

type GenerateResponse struct {
	Images []string `json:"images"`
	Error  *string  `json:"error,omitempty"`
}

type Client struct {
	baseURL    string
	httpClient *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL:    baseURL,
		httpClient: &http.Client{},
	}
}

func (c *Client) GenerateImages(req *GenerateRequest) (*GenerateResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := c.httpClient.Post(c.baseURL+"/api/images/generate", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var genResp GenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&genResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &genResp, nil
}
