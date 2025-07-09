import React from 'react';
import { useSimilarSearchStore } from '@/store/similarSearchStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import styles from './ImagePreviewCard.module.scss';

interface Props {
  img?: File | null;
}

const ImagePreviewCard: React.FC<{img?: File | null}> = ({ img }: Props) => {
  const similarSearchStore = useSimilarSearchStore();

  if (!similarSearchStore.targetImageSearchKey && !img) {
    return (
      <div className={styles.container}>
        <div className={styles.noImage}>
          <div className={styles.noImageIcon}>
            <FontAwesomeIcon icon={faImage} />
          </div>
          <h3>No Image Selected</h3>
          <p>Select an image to search for similar wallpapers</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.imagePreview}>
        <div className={styles.imageWrapper}>
          <img 
            src={img ? URL.createObjectURL(img) : (similarSearchStore.targetImageSearchKey || '')} 
            alt="Selected for similar search"
            className={styles.previewImage}
          />
        </div>
      </div>
      
      <div className={styles.footer}>
        <p className={styles.description}>
          This image will be used to find visually similar wallpapers using advanced AI algorithms
        </p>
      </div>
    </div>
  );
};

export default ImagePreviewCard; 