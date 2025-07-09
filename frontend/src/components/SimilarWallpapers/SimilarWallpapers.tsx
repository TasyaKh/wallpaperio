import React, { useCallback, useEffect, useState } from "react";
import { Wallpaper } from "@/models/wallpaper";
import { getSimilarWallpapers } from "../../api/wallpapers";
import styles from "./SimilarWallpapers.module.scss";
import { Loader } from "../Loader/Loader";
import WallpapersGrid from "../Wallpapers/WallpapersGrid/WallpapersGrid";

interface SimilarWallpapersProps {
  currentWallpaper: Wallpaper;
  onWallpaperClick: (wallpaper: Wallpaper) => void;
}

const ITEMS_PER_PAGE = 20;

const SimilarWallpapers: React.FC<SimilarWallpapersProps> = ({
  currentWallpaper,
  onWallpaperClick,
}) => {
  const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
  const [displayedWallpapers, setDisplayedWallpapers] = useState<Wallpaper[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasMore, setHasMore] = useState(true);

  const fetchSimilarWallpapers = useCallback(async () => {
    setError("");
    try {
      setLoading(true);
      const similar = await getSimilarWallpapers(currentWallpaper.id);
      setAllWallpapers(similar);
      setDisplayedWallpapers(similar.slice(0, ITEMS_PER_PAGE));
      setHasMore(similar.length > ITEMS_PER_PAGE);
    } catch (err) {
      setError("Failed to load similar wallpapers");
      setAllWallpapers([]);
      setDisplayedWallpapers([]);
      console.error("Error loading similar wallpapers:", err);
    } finally {
      setLoading(false);
    }
  }, [currentWallpaper.id]);

  useEffect(() => {
    fetchSimilarWallpapers();
  }, [fetchSimilarWallpapers]);

  const loadMore = () => {
    const nextItems = allWallpapers.slice(
      displayedWallpapers.length,
      displayedWallpapers.length + ITEMS_PER_PAGE
    );
    setDisplayedWallpapers((prev) => [...prev, ...nextItems]);
    setHasMore(
      displayedWallpapers.length + nextItems.length < allWallpapers.length
    );
  };

  if (loading) {
    return <Loader text="Loading similar wallpapers..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (allWallpapers.length === 0) {
    return null;
  }

  return (
    <div>
      <WallpapersGrid
        wallpapers={displayedWallpapers}
        hasMore={hasMore}
        loadMore={loadMore}
        isDeleting={false}
        onWallpaperClick={onWallpaperClick}
        onDelete={undefined}
      />
    </div>
  );
};

export default SimilarWallpapers;
