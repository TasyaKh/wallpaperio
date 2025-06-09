import React from 'react';
import Modal from '../Modal/Modal';
import styles from './ImagePreview.module.scss';
import ImageNavigation from './ImageNavigation';
import SimilarWallpapers from '../SimilarWallpapers/SimilarWallpapers';
import { Wallpaper } from '../../models/wallpaper';

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  currentWallpaper: Wallpaper;
  onWallpaperClick: (wallpaper: Wallpaper) => void;
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
  onWallpaperClick,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.previewContainer}>
        <div className={styles.mainContent}>
          <ImageNavigation
            imageUrl={imageUrl}
            title={title}
            onNext={onNext}
            onPrevious={onPrevious}
            isLoading={isLoading}
          />
        </div>

        <div className={styles.similarContainer}>
          <h3>Similar Wallpapers</h3>
          <SimilarWallpapers
            currentWallpaperId={currentWallpaper.id}
            onWallpaperClick={onWallpaperClick}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImagePreview; 