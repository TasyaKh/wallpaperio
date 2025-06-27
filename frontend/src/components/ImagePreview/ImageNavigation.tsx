import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faHeart, faHeartBroken } from '@fortawesome/free-solid-svg-icons';
import styles from './ImageNavigation.module.scss';
import defaultImage from '../../assets/not-found-image.svg';
import { PreviewWallpaperResponse } from '../../api/wallpapers';

interface ImageNavigationProps {
  imageUrl: string;
  title?: string;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  wallpaper: PreviewWallpaperResponse;
  onToggleFavorite: (wallpaperId: number, isFavorite: boolean) => void;
}

const ImageNavigation: React.FC<ImageNavigationProps> = ({
  imageUrl,
  title,
  onNext,
  onPrevious,
  isLoading = false,
  wallpaper,
  onToggleFavorite,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite(wallpaper.wallpaper.id, !wallpaper.is_favorite);
  };

  useEffect(()=>{
    setImgError(false)
  }, [imageUrl])

  return (
    <div className={styles.imageContainer}>
      <img 
        src={imgError ? defaultImage : imageUrl} 
        alt={title || 'Preview'} 
        className={`${styles.image} ${isLoading ? styles.loading : ''}`}
        onError={handleImageError}
      />
      
      <button 
        className={`${styles.navButton} ${styles.prevButton}`} 
        onClick={onPrevious}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      
      <button 
        className={`${styles.navButton} ${styles.nextButton}`} 
        onClick={onNext}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      <button 
        className={`${styles.favoriteButton} ${wallpaper.is_favorite ? styles.favorited : ''}`} 
        onClick={handleToggleFavorite}
        disabled={isLoading}
        title={wallpaper.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <FontAwesomeIcon icon={wallpaper.is_favorite ? faHeart : faHeartBroken} />
      </button>
    </div>
  );
};

export default ImageNavigation; 