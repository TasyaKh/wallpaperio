package dto

type BaseResponseImage struct {
	Status       string  `json:"status"`
	Error        *string `json:"error,omitempty"`
	TaskID       *string `json:"task_id,omitempty"`
	SavedPathURL *string `json:"saved_path_url,omitempty"`
}

type CompletedResponseImage struct {
	Status        string  `json:"status"`
	UrlPathThumb  string  `json:"url_path_thumb"`
	UrlPathMedium *string `json:"url_path_medium,omitempty"`
	UrlPath       string  `json:"url_path"`
	Error         *string `json:"error,omitempty"`
}

type FailedResponseImageStatus struct {
	Status string `json:"status"`
	Error  string `json:"error"`
}

type PendingResponseImage struct {
	Status string `json:"status"`
	TaskID string `json:"task_id"`
}

type ImageCreate struct {
	Prompt         string   `json:"prompt"`
	NegativePrompt *string  `json:"negative_prompt,omitempty"`
	Width          int      `json:"width"`
	Height         int      `json:"height"`
	Category       string   `json:"category"`
	Tags           []string `json:"tags"`
	GeneratorType  *string  `json:"generator_type,omitempty"`
}
