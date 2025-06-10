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
	GeneratorType  *string `json:"generator_type,omitempty"`
}

type GenerateResponse struct {
	TaskID       *string `json:"task_id,omitempty"`
	SavedPathURL string  `json:"saved_path_url"`
	Status       string  `json:"status"`
	Error        *string `json:"error,omitempty"`
}

type Client struct {
	baseURL    string
	httpClient *http.Client
}

type GeneratorsResponse struct {
	Generators []string `json:"generators"`
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL:    baseURL,
		httpClient: &http.Client{},
	}
}

func (c *Client) GenerateImageAI(req *GenerateRequest) (*GenerateResponse, error) {
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

func (c *Client) GetTaskStatus(taskID string) (*GenerateResponse, error) {
	resp, err := c.httpClient.Get(fmt.Sprintf("%s/api/images/status/%s", c.baseURL, taskID))
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var statusResp GenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&statusResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &statusResp, nil
}

func (c *Client) GetAvailableGenerators() (GeneratorsResponse, error) {
	resp, err := c.httpClient.Get(c.baseURL + "/api/images/generators")
	if err != nil {
		return GeneratorsResponse{}, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return GeneratorsResponse{}, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var result GeneratorsResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return GeneratorsResponse{}, fmt.Errorf("failed to decode response: %w", err)
	}

	return result, nil
}
