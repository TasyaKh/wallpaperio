import React, { useCallback, useEffect, useState } from "react";
import { Wallpaper } from "../../models/wallpaper";
import { getSimilarWallpapers } from "../../api/wallpapers";
import styles from "./SimilarWallpapers.module.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import defaultImage from "../../assets/not-found-image.svg";
import InfiniteScroll from "react-infinite-scroll-component";

interface SimilarWallpapersProps {
  currentWallpaperId: number;
  onWallpaperClick: (wallpaper: Wallpaper) => void;
}

const ITEMS_PER_PAGE = 10;

const SimilarWallpapers: React.FC<SimilarWallpapersProps> = ({
  currentWallpaperId,
  onWallpaperClick,
}) => {
  const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
  const [displayedWallpapers, setDisplayedWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [hasMore, setHasMore] = useState(true);

  const fetchSimilarWallpapers = useCallback(async () => {
    setError("");
    try {
      setLoading(true);
      const similar = await getSimilarWallpapers(currentWallpaperId);
      setAllWallpapers(similar);
      setDisplayedWallpapers(similar.slice(0, ITEMS_PER_PAGE));
      setHasMore(similar.length > ITEMS_PER_PAGE);
      setImageErrors({});
    } catch (err) {
      setError("Failed to load similar wallpapers");
      setAllWallpapers([]);
      setDisplayedWallpapers([]);
      console.error("Error loading similar wallpapers:", err);
    } finally {
      setLoading(false);
    }
  }, [currentWallpaperId]);

  useEffect(() => {
    fetchSimilarWallpapers();
  }, [fetchSimilarWallpapers]);

  const loadMore = () => {
    const nextItems = allWallpapers.slice(
      displayedWallpapers.length,
      displayedWallpapers.length + ITEMS_PER_PAGE
    );
    setDisplayedWallpapers(prev => [...prev, ...nextItems]);
    setHasMore(displayedWallpapers.length + nextItems.length < allWallpapers.length);
  };

  const handleImageError = (wallpaperId: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [wallpaperId]: true,
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Loading similar wallpapers...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (allWallpapers.length === 0) {
    return null;
  }

  return (
    <InfiniteScroll
      dataLength={displayedWallpapers.length}
      next={loadMore}
      hasMore={hasMore}
      loader={<div className={styles.loading}>Loading more wallpapers...</div>}
      endMessage={
        <p style={{ textAlign: 'center' }}>
          <b>No more wallpapers to load</b>
        </p>
      }
      scrollableTarget="previewContainer"
    >
      <div className={styles.grid}>
        {displayedWallpapers.map((wallpaper) => (
          <div
            key={`similar wallpaper ${wallpaper.id}`}
            className={styles.wallpaperItem}
            onClick={() => onWallpaperClick(wallpaper)}
          >
            <LazyLoadImage
              src={imageErrors[wallpaper.id] ? defaultImage : wallpaper.image_url}
              alt={`Similar wallpaper ${wallpaper.id}`}
              effect="blur"
              width="100%"
              height="100%"
              className={styles.image}
              placeholderSrc={`${wallpaper.image_url}?w=50`}
              onError={() => handleImageError(wallpaper.id)}
            />
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default SimilarWallpapers;
