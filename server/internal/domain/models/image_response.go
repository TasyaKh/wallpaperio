package models

type BaseResponse struct {
	Status       string  `json:"status"`
	Error        *string `json:"error,omitempty"`
	TaskID       *string `json:"task_id,omitempty"`
	SavedPathURL *string `json:"saved_path_url,omitempty"`
}

type CompletedResponse struct {
	Status        string  `json:"status"`
	SavedPathURL  string  `json:"saved_path_url"`
	ServerPathURL string  `json:"server_path_url"`
	Error         *string `json:"error,omitempty"`
}

type FailedResponse struct {
	Status string `json:"status"`
	Error  string `json:"error"`
}

type PendingResponse struct {
	Status string `json:"status"`
	TaskID string `json:"task_id"`
}
