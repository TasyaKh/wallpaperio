import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from './ImageNavigation.module.scss';
import defaultImage from '../../assets/not-found-image.svg';

interface ImageNavigationProps {
  imageUrl: string;
  title?: string;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

const ImageNavigation: React.FC<ImageNavigationProps> = ({
  imageUrl,
  title,
  onNext,
  onPrevious,
  isLoading = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
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
    </div>
  );
};

export default ImageNavigation; 