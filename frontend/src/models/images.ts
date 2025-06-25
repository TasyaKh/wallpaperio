export interface GeneratorsResponse {
  generators: string[];
}

export interface GenerateImageRequest {
  prompt: string;
  width: number;
  height: number;
  category: string;
  tags: string[];
  generator_type: string;
}

export interface GenerateImageResponse {
  status: string;
  task_id?: string;
  error?: string;
  url_path_thumb?: string;
  url_path?: string;
}
