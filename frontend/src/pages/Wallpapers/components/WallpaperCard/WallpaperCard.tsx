import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import styles from './WallpaperCard.module.scss';
import { Wallpaper } from '../../../../models/wallpaper';
import defaultImage from '../../../../assets/not-found-image.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onClick: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const WallpaperCard: React.FC<WallpaperCardProps> = ({ wallpaper, onClick, onDelete, isDeleting }) => {
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
  };

  useEffect(() => {
    setImgError(false);
  }, [wallpaper.image_url]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div className={styles.wallpaperCard} onClick={onClick}>
      <LazyLoadImage
        src={imgError ? defaultImage : wallpaper.image_url}
        alt={wallpaper.title}
        effect="blur"
        width="100%"
        height="100%"
        className={styles.image}
        placeholderSrc={`${wallpaper.image_url}?w=50`}
        onError={handleImageError}
      />
      <div className={styles.overlay}>
        <div className={styles.tags}>
          {wallpaper.tags.map((tag) => (
            <span key={tag.id} className={styles.tag}>
              {tag.name}
            </span>
          ))}
        </div>
        {onDelete && (
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete wallpaper"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
    </div>
  );
};

export default WallpaperCard; 