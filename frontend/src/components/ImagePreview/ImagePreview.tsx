import React from "react";
import Modal from "../Modal/Modal";
import styles from "./ImagePreview.module.scss";
import ImageNavigation from "./ImageNavigation";
import SimilarWallpapers from "../SimilarWallpapers/SimilarWallpapers";
import { Wallpaper } from "../../models/wallpaper";
import { PreviewWallpaperResponse } from "../../api/wallpapers";
import { TagsDisplay } from "../TagsDisplay/TagsDisplay";

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
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
            onNext={onNext}
            onPrevious={onPrevious}
            isLoading={isLoading}
            wallpaper={currentWallpaper}
            onToggleFavorite={onToggleFavorite}
          />
        </div>

        {currentWallpaper.wallpaper.tags && (
          <TagsDisplay tags={currentWallpaper.wallpaper.tags} />
        )}

        <div className={styles.similarContainer}>
          <h3>Similar</h3>
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
