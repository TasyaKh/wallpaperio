import axios from "./axios";

interface GeneratorsResponse {
  generators: string[];
}

interface GenerateImageRequest {
  prompt: string;
  width: number;
  height: number;
  category: string;
  tags: string[];
  generator_type: string;
}

interface GenerateImageResponse {
  status: string;
  task_id?: string;
  saved_path_url?: string;
  server_path_url?: string;
}

export interface ApiError {
  error: string;
}

export const getAvailableGenerators = async (): Promise<string[]> => {
  const response = await axios.get<GeneratorsResponse>(
    "/api/images/generators"
  );
  return response.data.generators;
};

export const generateImage = async (
  params: GenerateImageRequest
): Promise<GenerateImageResponse> => {
  const response = await axios.post<GenerateImageResponse>(
    "/api/images/generate",
    params
  );
  return response.data;
};

export const getGenerationStatus = async (taskId: string): Promise<GenerateImageResponse> => {
  const response = await axios.get<GenerateImageResponse>(`/api/images/status/${taskId}`);
  return response.data;
};
