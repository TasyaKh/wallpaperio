import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from './ImageNavigation.module.scss';

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
  return (
    <div className={styles.imageContainer}>
      <img 
        src={imageUrl} 
        alt={title || 'Preview'} 
        className={`${styles.image} ${isLoading ? styles.loading : ''}`} 
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