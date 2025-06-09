import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import styles from './WallpaperCard.module.scss';
import { Wallpaper } from '../../../../models/wallpaper';

interface WallpaperCardProps {
  wallpaper:Wallpaper
  onClick: () => void;
}

const WallpaperCard: React.FC<WallpaperCardProps> = ({ wallpaper, onClick }) => {
  return (
    <div className={styles.wallpaperCard} onClick={onClick}>
      <LazyLoadImage
        src={wallpaper.image_url}
        alt={wallpaper.title}
        effect="blur"
        width="100%"
        height="100%"
        className={styles.image}
        placeholderSrc={`${wallpaper.image_url}?w=50`} 
      />
      <div className={styles.overlay}>
        <div className={styles.tags}>
          {wallpaper.tags.map((tag) => (
            <span key={tag.id} className={styles.tag}>
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WallpaperCard; 