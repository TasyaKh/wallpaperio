import api from "./axios";
import {
  NextPreviousWallpaperFilter,
  Wallpaper,
  WallpaperResponse,
} from "../models/wallpaper";

interface GetWallpapersParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PreviewWallpaperResponse {
  wallpaper: Wallpaper;
  is_favorite: boolean;
}

export const getWallpapers = async (
  params: GetWallpapersParams = {}
): Promise<WallpaperResponse> => {
  const response = await api.get<WallpaperResponse>("/api/wallpapers", {
    params,
  });
  return response.data;
};

export const getAdjacentWallpaper = async (
  wallpaperId: number,
  direction: "next" | "previous",
  filter: NextPreviousWallpaperFilter
): Promise<PreviewWallpaperResponse> => {
  const response = await api.get<PreviewWallpaperResponse>(
    `/api/wallpapers/${wallpaperId}/${direction}`,
    { params: filter }
  );
  return response.data;
};

export const getSimilarWallpapers = async (
  id: number,
  limit: number = 150
): Promise<Wallpaper[]> => {
  const response = await api.get<Wallpaper[]>(`/api/wallpapers/${id}/similar`, {
    params: { limit },
  });
  return response.data;
};

export const createWallpaper = async (data: {
  image_url: string;
  image_thumb_url?: string;
  image_medium_url?: string;
  category: string;
  tags: string[];
}): Promise<Wallpaper> => {
  const response = await api.post<Wallpaper>("/api/wallpapers", data);
  return response.data;
};

export const deleteWallpaper = async (id: number): Promise<void> => {
  await api.delete(`/api/wallpapers/${id}`);
};

export const addFavorite = async (wallpaperId: number): Promise<void> => {
  await api.post(`/api/wallpapers/${wallpaperId}/favorite`);
};

export const removeFavorite = async (wallpaperId: number): Promise<void> => {
  await api.delete(`/api/wallpapers/${wallpaperId}/favorite`);
};

export const getFavorites = async (limit?: number, offset?: number): Promise<{ wallpapers: Wallpaper[]; total: number }> => {
  const params: any = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;
  
  const response = await api.get<{ wallpapers: Wallpaper[]; total: number }>("/api/wallpapers/favorites", { params });
  return response.data;
};

export const getWallpaperInfo = async (wallpaperId: number): Promise<PreviewWallpaperResponse> => {
  const response = await api.get<PreviewWallpaperResponse>(`/api/wallpapers/${wallpaperId}/info`);
  return response.data;
};
