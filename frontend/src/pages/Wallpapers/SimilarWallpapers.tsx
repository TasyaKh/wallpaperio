import { useCallback, useEffect, useState } from "react";
import { useSimilarSearchStore } from "@/store/similarSearchStore";
import WallpapersGrid from "@/components/Wallpapers/WallpapersGrid/WallpapersGrid";
import ImagePreview from "@/components/ImagePreview/ImagePreview";
import { searchSimilarWByImg, getWallpaperInfo, addFavorite, removeFavorite } from "@/api/wallpapers";
import { toast } from "react-toastify";
import type { Wallpaper } from "@/models/wallpaper";

const LIMIT = 20;

const SimilarWallpapers = () => {
  const key = useSimilarSearchStore((s) => s.targetImageSearchKey);

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState<{
    wallpaper: Wallpaper;
    is_favorite: boolean;
  } | null>(null);

  const fetchWallpapers = useCallback(async (reset = false) => {
    if (!key) return;
    setLoading(true);
    const start = reset ? 0 : offset;

    try {
      const results = await searchSimilarWByImg({ key, offset: start, limit: LIMIT });
      setWallpapers((prev) => (reset ? results : [...prev, ...results]));
      setOffset(start + results.length);
      setHasMore(results.length === LIMIT);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [key, offset]);

  const loadWallpaperInfo = async (id: number) => {
    try {
      setLoading(true);
      const info = await getWallpaperInfo(id);
      setSelectedWallpaper({ wallpaper: info.wallpaper, is_favorite: info.is_favorite });
    } catch {
      toast.error("Failed to load wallpaper info");
    } finally {
      setLoading(false);
    }
  };

  const handleWallpaperClick = (wallpaper: Wallpaper, idx: number) => {
    setCurrentIndex(idx);
    loadWallpaperInfo(wallpaper.id);
  };

  const handleNext = () => {
    if (currentIndex === null) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < wallpapers.length) {
      setCurrentIndex(nextIndex);
      loadWallpaperInfo(wallpapers[nextIndex].id);
    } else if (hasMore && !loading) {
      fetchWallpapers().then(() => {
        const newWallpaper = wallpapers[nextIndex];
        if (newWallpaper) {
          setCurrentIndex(nextIndex);
          loadWallpaperInfo(newWallpaper.id);
        }
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      loadWallpaperInfo(wallpapers[prevIndex].id);
    }
  };

  const handleToggleFavorite = async (id: number, isFav: boolean) => {
    try {
      isFav ? await addFavorite(id) : await removeFavorite(id);

      if (selectedWallpaper?.wallpaper.id === id) {
        setSelectedWallpaper({ ...selectedWallpaper, is_favorite: isFav });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update favorite");
    }
  };

  const handleSimilarWallpaperClick = (wallpaper: Wallpaper) => {
    loadWallpaperInfo(wallpaper.id);
  }

  useEffect(() => {
    if (!key) return;
    setWallpapers([]);
    setOffset(0);
    setHasMore(true);
    fetchWallpapers(true);
  }, [key]);

  return (
    <div className="container">
      <h2 className="gradient-title">Similar Wallpapers</h2>
   
      <WallpapersGrid
        wallpapers={wallpapers}
        hasMore={hasMore}
        loadMore={() => !loading && hasMore && fetchWallpapers()}
        isDeleting={false}
        onWallpaperClick={handleWallpaperClick}
        onDelete={() => {}}
      />

      {selectedWallpaper && (
        <ImagePreview
          isOpen={true}
          onClose={() => setSelectedWallpaper(null)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLoading={loading}
          currentWallpaper={selectedWallpaper}
          onSimilarWallpaperClick={handleSimilarWallpaperClick}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default SimilarWallpapers;
