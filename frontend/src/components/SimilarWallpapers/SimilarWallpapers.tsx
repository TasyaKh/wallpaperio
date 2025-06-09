import React, { useEffect, useState } from "react";
import { Wallpaper } from "../../models/wallpaper";
import { getSimilarWallpapers } from "../../api/wallpapers";
import styles from "./SimilarWallpapers.module.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

interface SimilarWallpapersProps {
  currentWallpaperId: number;
  onWallpaperClick: (wallpaper: Wallpaper) => void;
}

const SimilarWallpapers: React.FC<SimilarWallpapersProps> = ({
  currentWallpaperId,
  onWallpaperClick,
}) => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarWallpapers = async () => {
      try {
        setLoading(true);
        const similar = await getSimilarWallpapers(currentWallpaperId);
        setWallpapers(similar);
      } catch (err) {
        setError("Failed to load similar wallpapers");
        console.error("Error loading similar wallpapers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarWallpapers();
  }, [currentWallpaperId]);

  if (loading) {
    return <div className={styles.loading}>Loading similar wallpapers...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (wallpapers.length === 0) {
    return null;
  }

  return (
    <div className={styles.grid}>
      {wallpapers.map((wallpaper) => (
        <div
          key={wallpaper.id}
          className={styles.wallpaperItem}
          onClick={() => onWallpaperClick(wallpaper)}
        >
          <LazyLoadImage
            src={wallpaper.image_url}
            alt={wallpaper.title}
            effect="blur"
            className={styles.image}
            placeholderSrc={`${wallpaper.image_url}?w=50`}
          />
        </div>
      ))}
    </div>
  );
};

export default SimilarWallpapers;
