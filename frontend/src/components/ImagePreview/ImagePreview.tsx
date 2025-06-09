import React from 'react';
import Modal from '../Modal/Modal';
import styles from './ImagePreview.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  onNext,
  onPrevious,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.previewContainer}>
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
      </div>
    </Modal>
  );
};

export default ImagePreview; 