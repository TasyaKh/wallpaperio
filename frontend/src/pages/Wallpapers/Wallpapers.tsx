import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  getWallpapers,
  getNextWallpaper,
  getPreviousWallpaper,
  deleteWallpaper,
} from "../../api/wallpapers";
import { getCategories } from "../../api/categories";
import styles from "./Wallpapers.module.scss";
import { Wallpaper } from "../../models/wallpaper";
import { Category } from "../../models/category";
import WallpaperCard from "./components/WallpaperCard/WallpaperCard";
import ImagePreview from "../../components/ImagePreview/ImagePreview";
import CategoryFilter from "./components/CategoryFilter/CategoryFilter";
import { useAuth } from "../../contexts/AuthContext";
import { RoleManager } from "../../utils/roles";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 12;

export default function Wallpapers() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCategory = searchParams.get("category") ?? "";

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
          limit: ITEMS_PER_PAGE,
          offset: 0,
        });
        setWallpapers(response.wallpapers);
        setTotal(response.total);
        setOffset(ITEMS_PER_PAGE);
        setHasMore(response.wallpapers.length < response.total);
      } catch (err) {
        setError("Failed to load wallpapers");
        console.error("Error loading wallpapers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallpapers();
  }, [selectedCategory]);

  const loadMore = async () => {
    try {
      const response = await getWallpapers({
        category: selectedCategory || undefined,
        limit: ITEMS_PER_PAGE,
        offset,
      });
      setWallpapers((prev) => [...prev, ...response.wallpapers]);
      setOffset((prev) => prev + ITEMS_PER_PAGE);
      setHasMore(wallpapers.length + response.wallpapers.length < total);
    } catch (err) {
      console.error("Error loading more wallpapers:", err);
    }
  };

  const handleCategoryChange = (categoryName: string | null) => {
    setSearchParams(categoryName ? { category: categoryName } : {});
  };

  const handleWallpaperClick = (wallpaper: Wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setIsPreviewOpen(true);
  };

  const handleNextImage = async () => {
    if (!selectedWallpaper) return;

    try {
      setIsNavigating(true);
      const prevWallpaper = await getNextWallpaper(selectedWallpaper.id, {
        category: selectedCategory,
      });
      setSelectedWallpaper(prevWallpaper);
    } catch (err) {
      console.error("Error fetching previous wallpaper:", err);
    } finally {
      setIsNavigating(false);
    }
  };

  const handlePreviousImage = async () => {
    if (!selectedWallpaper) return;

    try {
      setIsNavigating(true);
      const nextWallpaper = await getPreviousWallpaper(selectedWallpaper.id, {
        category: selectedCategory,
      });
      setSelectedWallpaper(nextWallpaper);
    } catch (err) {
      console.error("Error fetching next wallpaper:", err);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleDeleteWallpaper = async (wallpaperId: number) => {
    if (!user || !RoleManager.canManageContent(user.role)) {
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

  if (loading && wallpapers.length === 0) {
    return <div className={styles.loading}>Loading wallpapers...</div>;
  }

  if (error && wallpapers.length === 0) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={"container"}>
      <h1>Wallpapers</h1>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      <InfiniteScroll
        dataLength={wallpapers.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className={styles.loading}>Loading more...</div>}
        endMessage={
          <p className={styles.endMessage}>
            {wallpapers.length > 0
              ? "You've seen all wallpapers!"
              : "No wallpapers found."}
          </p>
        }
      >
        <div className={styles.grid}>
          {wallpapers.map((wallpaper) => (
            <WallpaperCard
              key={`wallpaper ${wallpaper.id}`}
              wallpaper={wallpaper}
              onClick={() => handleWallpaperClick(wallpaper)}
              onDelete={
                user && RoleManager.canManageContent(user.role)
                  ? () => handleDeleteWallpaper(wallpaper.id)
                  : undefined
              }
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </InfiniteScroll>

      {selectedWallpaper && (
        <ImagePreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          imageUrl={selectedWallpaper.image_url}
          title={selectedWallpaper.title}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          isLoading={isNavigating}
          currentWallpaper={selectedWallpaper}
          onWallpaperClick={handleWallpaperClick}
        />
      )}
    </div>
  );
}
