import { Category } from "./category";

export interface Tag {
  id: number;
  name: string;
}

export interface Wallpaper {
  id: number;
  title: string;
  image_url: string;
  image_thumb_url: string;
  category: Category;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface WallpaperResponse {
  wallpapers: Wallpaper[];
  total: number;
  limit: number;
  offset: number;
}

export interface NextPreviousWallpaperFilter {
  category?: string;
}
