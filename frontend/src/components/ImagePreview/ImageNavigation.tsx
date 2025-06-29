import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faHeart, faHeartBroken } from '@fortawesome/free-solid-svg-icons';
import styles from './ImageNavigation.module.scss';
import defaultImage from '../../assets/not-found-image.svg';
import { PreviewWallpaperResponse } from '../../api/wallpapers';
import { LazyImage } from '../LazyImage/LazyImage';

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

  const handleImageError = () => {
    setImgError(true);
  };

  const handleImageLoad = () => {
    setImgError(false);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite(wallpaperData.wallpaper.id, !wallpaperData.is_favorite);
  };

  useEffect(() => {
    setImgError(false);
  }, [wallpaperData.wallpaper.image_url, wallpaperData.wallpaper.image_medium_url]);

  const displayImage = imgError ? defaultImage : wallpaperData.wallpaper.image_url;

  return (
    <div className={styles.imageContainer}>
      <LazyImage
        key={wallpaperData.wallpaper.id}
        src={displayImage}
        alt={'Preview'}
        placeholderSrc={wallpaperData.wallpaper.image_thumb_url}
        fallbackSrc={defaultImage}
        objectFit="contain"
        onLoad={handleImageLoad}
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
        className={`${styles.favoriteButton} ${wallpaperData.is_favorite ? styles.favorited : ''}`} 
        onClick={handleToggleFavorite}
        disabled={isLoading}
        title={wallpaperData.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <FontAwesomeIcon icon={wallpaperData.is_favorite ? faHeart : faHeartBroken} />
      </button>
    </div>
  );
};

export default ImageNavigation; 