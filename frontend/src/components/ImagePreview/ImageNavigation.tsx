import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faHeart,
  faHeartBroken,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ImageNavigation.module.scss";
import defaultImage from "../../assets/not-found-image.svg";
import { PreviewWallpaperResponse } from "../../api/wallpapers";
import { LazyImage } from "../LazyImage/LazyImage";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
import { installWallpaper } from "../../api/wallpapers";
import IconButton from "../Buttons/IconButton/IconButton";

interface ImageNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  wallpaper: PreviewWallpaperResponse;
  onToggleFavorite: (wallpaperId: number, isFavorite: boolean) => void;
}

const ImageNavigation: React.FC<ImageNavigationProps> = ({
  onNext,
  onPrevious,
  isLoading = false,
  wallpaper: wallpaperData,
  onToggleFavorite,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const { user } = useAuth();

  const handleImageError = () => {
    setImgError(true);
  };

  const handleImageLoad = () => {
    setImgError(false);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info("Please sign in to add wallpapers to favorites");
      return;
    }

    if (isFavoriting) return;

    setIsFavoriting(true);
    try {
      await onToggleFavorite(
        wallpaperData.wallpaper.id,
        !wallpaperData.is_favorite
      );
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setIsFavoriting(false);
    }
  };

  const installWallpaperHandler = async () => {
    if (isInstalling) return;

    setIsInstalling(true);
    try {
      const blob = await installWallpaper(wallpaperData.wallpaper.id);
      const filename =
        wallpaperData.wallpaper.image_url.split("/").pop() || "wallpaper.jpg";
      saveAs(blob, filename);
    } catch (err) {
      console.error("Install failed:", err);
    } finally {
      setIsInstalling(false);
    }
  };

  useEffect(() => {
    setImgError(false);
  }, [
    wallpaperData.wallpaper.image_url,
    wallpaperData.wallpaper.image_medium_url,
  ]);

  const displayImage = imgError
    ? defaultImage
    : wallpaperData.wallpaper.image_url;

  return (
    <div className={styles.imageContainer}>
      <LazyImage
        key={wallpaperData.wallpaper.id}
        src={displayImage}
        alt={"Preview"}
        placeholderSrc={wallpaperData.wallpaper.image_thumb_url}
        fallbackSrc={defaultImage}
        objectFit="contain"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      <IconButton
        icon={faChevronLeft}
        onClick={onPrevious}
        disabled={isLoading}
        className={`${styles.navButton} ${styles.prevButton}`}
      />

      <IconButton
        icon={faChevronRight}
        onClick={onNext}
        disabled={isLoading}
        className={`${styles.navButton} ${styles.nextButton}`}
      />

      <IconButton
        icon={wallpaperData.is_favorite ? faHeart : faHeartBroken}
        onClick={handleToggleFavorite}
        disabled={isFavoriting || isLoading}
        loading={isFavoriting}
        title={"Add to favorites"}
        className={`${styles.favoriteButton} ${wallpaperData.is_favorite ? styles.favorited : ""}`}
      />

      <IconButton
        icon={faDownload}
        onClick={installWallpaperHandler}
        disabled={isInstalling || isLoading}
        loading={isInstalling}
        title={isInstalling ? "Installing..." : "Install this wallpaper"}
        className={styles.installButton}
      />
    </div>
  );
};

export default ImageNavigation;
