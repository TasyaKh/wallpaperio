import React from "react";
import Modal from "../Modal/Modal";
import styles from "./ImagePreview.module.scss";
import ImageNavigation from "./ImageNavigation";
import SimilarWallpapers from "../SimilarWallpapers/SimilarWallpapers";
import { Wallpaper } from "../../models/wallpaper";
import { PreviewWallpaperResponse } from "../../api/wallpapers";

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  currentWallpaper: PreviewWallpaperResponse;
  onSimilarWallpaperClick: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (wallpaperId: number, isFavorite: boolean) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  onNext,
  onPrevious,
  isLoading = false,
  currentWallpaper,
  onSimilarWallpaperClick,
  onToggleFavorite,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.previewContainer}>
        <div>
          <ImageNavigation
            imageUrl={imageUrl}
            title={title}
            onNext={onNext}
            onPrevious={onPrevious}
            isLoading={isLoading}
            wallpaper={currentWallpaper}
            onToggleFavorite={onToggleFavorite}
          />
        </div>

        <div className={styles.similarContainer}>
          <h3>Similar Wallpapers</h3>
          <SimilarWallpapers
            currentWallpaperId={currentWallpaper.wallpaper.id}
            onWallpaperClick={onSimilarWallpaperClick}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImagePreview;
