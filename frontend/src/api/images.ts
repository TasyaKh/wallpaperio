import { GeneratorsResponse, GenerateImageRequest, GenerateImageResponse } from "../models/images";
import axios from "./axios";


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
