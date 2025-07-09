import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getWallpapers,
  getWallpaperInfo,
  deleteWallpaper,
  addFavorite,
  removeFavorite,
  PreviewWallpaperResponse,
} from "../../api/wallpapers";
import { getCategories } from "../../api/categories";
import { Wallpaper } from "../../models/wallpaper";
import { Category } from "../../models/category";
import ImagePreview from "../../components/ImagePreview/ImagePreview";
import CategoryFilter from "./components/CategoryFilter/CategoryFilter";
import { useAuth } from "../../contexts/AuthContext";
import { RoleManager } from "../../utils/roles";
import { toast } from "react-toastify";
import WallpapersGrid from "../../components/Wallpapers/WallpapersGrid/WallpapersGrid";
import { Loader } from "@/components/Loader/Loader";
import "./Wallpapers.module.scss"

const ITEMS_PER_PAGE = 12;

export default function Wallpapers() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedWallpaper, setSelectedWallpaper] =
    useState<PreviewWallpaperResponse | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const selectedCategory = searchParams.get("category") ?? "";
  const searchQuery = searchParams.get("search") ?? "";

  const loadMore = async () => {
    try {
      const response = await getWallpapers({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: ITEMS_PER_PAGE,
        offset,
      });

      setWallpapers((prev) => {
        const existingIds = new Set(prev.map((w) => w.id));

        // Only add wallpapers that don't already exist
        const newWallpapers = response.wallpapers.filter(
          (w) => !existingIds.has(w.id)
        );

        return [...prev, ...newWallpapers];
      });

      setOffset((prev) => prev + ITEMS_PER_PAGE);
      setHasMore(wallpapers.length + response.wallpapers.length < total);
    } catch (err) {
      console.error("Error loading more wallpapers:", err);
    }
  };

  const handleCategoryChange = (categoryName: string | null) => {
    setSearchParams(categoryName ? { category: categoryName } : {});
  };

  const handleWallpaperClick = async (wallpaper: Wallpaper, idx: number) => {
    setCurrentIndex(idx);
    try {
      const wallpaperInfo = await getWallpaperInfo(wallpaper.id);
      setSelectedWallpaper(wallpaperInfo);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error("Error fetching wallpaper info:", err);
      const fallbackInfo = { wallpaper, is_favorite: false };
      setSelectedWallpaper(fallbackInfo);
      setIsPreviewOpen(true);
    }
  };

  const handleSimilarWallpaperClick = async (wallpaper: Wallpaper) => {
    try {
      const wallpaperInfo = await getWallpaperInfo(wallpaper.id);
      setSelectedWallpaper(wallpaperInfo);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error("Error fetching wallpaper info:", err);
      setSelectedWallpaper({ wallpaper, is_favorite: false });
      setIsPreviewOpen(true);
    }
  };

  const handleNextImage = async () => {
    if (currentIndex === null) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex < wallpapers.length) {
      setCurrentIndex(nextIndex);
      try {
        const wallpaperInfo = await getWallpaperInfo(wallpapers[nextIndex].id);
        setSelectedWallpaper(wallpaperInfo);
      } catch (err) {
        console.error("Error fetching wallpaper info:", err);
        setSelectedWallpaper({ wallpaper: wallpapers[nextIndex], is_favorite: false });
      }
    } else if (hasMore) {
      await loadMore();
      if (nextIndex < wallpapers.length) {
        setCurrentIndex(nextIndex);
        try {
          const wallpaperInfo = await getWallpaperInfo(wallpapers[nextIndex].id);
          setSelectedWallpaper(wallpaperInfo);
        } catch (err) {
          setSelectedWallpaper({ wallpaper: wallpapers[nextIndex], is_favorite: false });
        }
      }
    }
  };

  const handlePreviousImage = async () => {
    if (currentIndex === null) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      try {
        const wallpaperInfo = await getWallpaperInfo(wallpapers[prevIndex].id);
        setSelectedWallpaper(wallpaperInfo);
      } catch (err) {
        setSelectedWallpaper({ wallpaper: wallpapers[prevIndex], is_favorite: false });
      }
    }
  };

  const handleDeleteWallpaper = async (wallpaperId: number) => {
    if (!user || !RoleManager.canDeleteWallpapers(user.role)) {
      toast.error("You do not have permission to delete wallpapers");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this wallpaper?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteWallpaper(wallpaperId);
      setWallpapers((prev) => prev.filter((w) => w.id !== wallpaperId));
      setTotal((prev) => prev - 1);
      toast.success("Wallpaper deleted successfully");
    } catch (err) {
      console.error("Error deleting wallpaper:", err);
      toast.error("Failed to delete wallpaper");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async (
    wallpaperId: number,
    isFavorite: boolean
  ) => {
    try {
      if (isFavorite) {
        await addFavorite(wallpaperId);
      } else {
        await removeFavorite(wallpaperId);
        toast.success("Removed from favorites");
      }

      if (selectedWallpaper && selectedWallpaper.wallpaper.id === wallpaperId) {
        setSelectedWallpaper({
          ...selectedWallpaper,
          is_favorite: isFavorite,
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorite status");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const response = await getWallpapers({
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          limit: ITEMS_PER_PAGE,
          offset: 0,
        });
        setWallpapers(response.wallpapers);
        setTotal(response.total);
        setOffset(ITEMS_PER_PAGE);
        setHasMore(response.wallpapers.length < response.total);
      } catch (err) {
        console.error("Error loading wallpapers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallpapers();
  }, [selectedCategory, searchQuery]);

  return (
    <div className={"container"}>
      <h2 className={"gradient-title"}>Wallpapers</h2>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      {loading && wallpapers.length === 0 ? (
        <Loader text="Loading wallpapers..." />
      ) : (
        <WallpapersGrid
          wallpapers={wallpapers}
          hasMore={hasMore}
          loadMore={loadMore}
          isDeleting={isDeleting}
          onWallpaperClick={handleWallpaperClick}
          onDelete={handleDeleteWallpaper}
        />
      )}
      {selectedWallpaper && (
        <ImagePreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          currentWallpaper={selectedWallpaper}
          onSimilarWallpaperClick={handleSimilarWallpaperClick}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
