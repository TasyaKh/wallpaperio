import api from "./axios";
import {
  NextPreviousWallpaperFilter,
  Wallpaper,
  WallpaperResponse,
} from "../models/wallpaper";

interface GetWallpapersParams {
  category?: string;
  limit?: number;
  offset?: number;
}

export const getWallpapers = async (
  params: GetWallpapersParams = {}
): Promise<WallpaperResponse> => {
  const response = await api.get<WallpaperResponse>("/api/wallpapers", {
    params,
  });
  return response.data;
};

export const getNextWallpaper = async (
  wallpaperId: number,
  filter: NextPreviousWallpaperFilter
): Promise<Wallpaper> => {
  const response = await api.get<Wallpaper>(
    `/api/wallpapers/${wallpaperId}/next`,
    { params: filter }
  );
  return response.data;
};

export const getPreviousWallpaper = async (
  wallpaperId: number,
  filter: NextPreviousWallpaperFilter
): Promise<Wallpaper> => {
  const response = await api.get<Wallpaper>(
    `/api/wallpapers/${wallpaperId}/previous`,
    { params: filter }
  );
  return response.data;
};

export const getSimilarWallpapers = async (
  id: number,
  limit?: number
): Promise<Wallpaper[]> => {
  const response = await api.get<Wallpaper[]>(`/api/wallpapers/${id}/similar`, {
    params: { limit },
  });
  return response.data;
};

export const createWallpaper = async (data: {
  image_url: string;
  category: string;
  tags: string[];
}): Promise<Wallpaper> => {
  const response = await api.post<Wallpaper>("/api/wallpapers", data);
  return response.data;
};

export const deleteWallpaper = async (id: number): Promise<void> => {
  await api.delete(`/api/wallpapers/${id}`);
};
