import api from './axios';
import { Wallpaper, WallpaperResponse } from '../models/wallpaper';

interface GetWallpapersParams {
  category?: string;
  limit?: number;
  offset?: number;
}

export const getWallpapers = async (params: GetWallpapersParams = {}): Promise<WallpaperResponse> => {
  const response = await api.get<WallpaperResponse>('/api/wallpapers', { params });
  return response.data;
}; 