import { useEffect, useState, useCallback } from "react";
import { Wallpaper } from "../../models/wallpaper";
import { PreviewWallpaperResponse, getFavorites, getWallpaperInfo, addFavorite, removeFavorite } from "../../api/wallpapers";
import WallpapersGrid from "../../components/Wallpapers/WallpapersGrid/WallpapersGrid";
import ImagePreview from "../../components/ImagePreview/ImagePreview";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 12;

const Favorites = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedWallpaper, setSelectedWallpaper] = useState<PreviewWallpaperResponse | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastFavoriteIndex, setLastFavoriteIndex] = useState<number>(-1);

  const loadMore = async () => {
    try {
      const response = await getFavorites(ITEMS_PER_PAGE, offset);
      setWallpapers((prev) => [...prev, ...response.wallpapers]);
      setOffset((prev) => prev + ITEMS_PER_PAGE);
      setHasMore(wallpapers.length + response.wallpapers.length < response.total);
    } catch (err) {
      console.error("Error loading more favorites:", err);
      toast.error("Failed to load more favorites");
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
        console.log("Fetching favorites with limit:", ITEMS_PER_PAGE, "and offset:", 0);
      try {
        setLoading(true);
        const response = await getFavorites(ITEMS_PER_PAGE, 0);
        setWallpapers(response.wallpapers);
        setTotal(response.total);
        setOffset(ITEMS_PER_PAGE);
        setHasMore(response.wallpapers.length < response.total);
      } catch (err) {
        console.error("Error loading favorites:", err);
        setError("Failed to load favorites");
        toast.error("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleWallpaperClick = useCallback(async (wallpaper: Wallpaper) => {
    try {
      const wallpaperInfo = await getWallpaperInfo(wallpaper.id);
      setSelectedWallpaper(wallpaperInfo);
      setIsPreviewOpen(true);

      // If this wallpaper is in favorites, save its index
      const favIndex = wallpapers.findIndex(w => w.id === wallpaper.id);
      if (favIndex !== -1) setLastFavoriteIndex(favIndex);
    } catch (err) {
      console.error("Error fetching wallpaper info:", err);
      setSelectedWallpaper({ wallpaper, is_favorite: true });
      setIsPreviewOpen(true);
    }
  }, [wallpapers]);

  const handleToggleFavorite = async (wallpaperId: number, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await addFavorite(wallpaperId);
      } else {
        await removeFavorite(wallpaperId);
        
        setWallpapers(prev => prev.filter(w => w.id !== wallpaperId));
        setTotal(prev => prev - 1);
        if (selectedWallpaper && selectedWallpaper.wallpaper.id === wallpaperId) {
          setIsPreviewOpen(false);
          setSelectedWallpaper(null);
        }
      }

      // Refresh the wallpaper info to get updated favorite status
      if (selectedWallpaper && selectedWallpaper.wallpaper.id === wallpaperId) {
        try {
          const updatedInfo = await getWallpaperInfo(wallpaperId);
          setSelectedWallpaper(updatedInfo);
        } catch (err) {
          console.error("Error refreshing wallpaper info:", err);
          setSelectedWallpaper({
            ...selectedWallpaper,
            is_favorite: isFavorite,
          });
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorite status");
    }
  };

  const navigateToWallpaper = useCallback(
    async (direction: 'next' | 'previous') => {
      if (!selectedWallpaper) return;

      setIsNavigating(true);
      try {
        let currentIndex = wallpapers.findIndex(
          w => w.id === selectedWallpaper.wallpaper.id
        );

        // If not in favorites, use lastFavoriteIndex
        if (currentIndex === -1) currentIndex = lastFavoriteIndex;

        let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        // Check if we need to load more favorites
        if (targetIndex < 0 || targetIndex >= wallpapers.length) {
          if (hasMore) {
            await loadMore();
            targetIndex = direction === 'next' ? 0 : wallpapers.length - 1;
          } else {
            toast.error("No more favorites to show");
            return;
          }
        }

        // Get next wallpaper from favorites
        const nextWallpaper = wallpapers[targetIndex];
        const wallpaperInfo = await getWallpaperInfo(nextWallpaper.id);
        setSelectedWallpaper(wallpaperInfo);
      } finally {
        setIsNavigating(false);
      }
    },
    [selectedWallpaper, wallpapers, hasMore, loadMore, lastFavoriteIndex]
  );

  if (loading && wallpapers.length === 0) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading favorites...</div>;
  }

  if (error && wallpapers.length === 0) {
    return <div style={{ textAlign: "center", marginTop: "2rem", color: "red" }}>{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="gradient-title">Favorite Wallpapers</h1>
      {total > 0 && (
        <p style={{ textAlign: "center", marginBottom: "1rem", color: "var(--color-text-secondary)" }}>
          {total} favorite{total !== 1 ? 's' : ''}
        </p>
      )}
      <WallpapersGrid
        wallpapers={wallpapers}
        hasMore={hasMore}
        loadMore={loadMore}
        onWallpaperClick={handleWallpaperClick}
      />

      {selectedWallpaper && (
        <ImagePreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          imageUrl={selectedWallpaper.wallpaper.image_url}
          title={selectedWallpaper.wallpaper.title}
          onNext={() => navigateToWallpaper('next')}
          onPrevious={() => navigateToWallpaper('previous')}
          isLoading={isNavigating}
          currentWallpaper={selectedWallpaper}
          onSimilarWallpaperClick={handleWallpaperClick}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default Favorites;
