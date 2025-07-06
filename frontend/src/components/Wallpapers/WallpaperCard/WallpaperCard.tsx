import React, { useState } from 'react';
import styles from './WallpaperCard.module.scss';
import { Wallpaper } from '../../../models/wallpaper';
import defaultImage from '@/assets/not-found-image.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { LazyImage } from '../../LazyImage/LazyImage';

export interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onClick: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const WallpaperCard: React.FC<WallpaperCardProps> = ({ wallpaper, onClick, onDelete, isDeleting }) => {
  const [aspect, setAspect] = useState(1);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setAspect(naturalWidth / naturalHeight);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      className={styles.wallpaperCard}
      style={{ aspectRatio: aspect }}
      onClick={onClick}
      id={`wallpaper-${wallpaper.id}`}
    >
      <LazyImage
        src={wallpaper.image_medium_url ?? wallpaper.image_url}
        alt={`Wallpaper ${wallpaper.id}`}
        placeholderSrc={wallpaper.image_thumb_url}
        fallbackSrc={defaultImage}
        objectFit="cover"
        onLoad={handleImageLoad}
      />
      
      <div className={styles.overlay}>
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