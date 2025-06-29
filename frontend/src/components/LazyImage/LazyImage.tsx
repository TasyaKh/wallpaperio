import React, { useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import styles from './LazyImage.module.scss';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  containerClassName?: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: () => void;
  fallbackSrc?: string;
  objectFit?: 'cover' | 'contain';
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc,
  containerClassName = '',
  onLoad,
  onError,
  fallbackSrc,
  objectFit = 'cover',
}) => {
  const [imgError, setImgError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleImageError = () => {
    setImgError(true);
    onError?.();
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageLoaded(true);
    onLoad?.(e);
  };

  const imageSrc = imgError && fallbackSrc ? fallbackSrc : src;

  const imageStyle = {
    objectFit: objectFit as 'cover' | 'contain',
  };

  return (
    <div ref={inViewRef} className={`${styles.lazyImageContainer} ${containerClassName}`}>
      {inView && (
        <img
          ref={imageRef}
          src={imageSrc}
          alt={alt}
          style={imageStyle}
          className={`${styles.image} ${imageLoaded ? styles.loaded : styles.loading}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      {!inView && placeholderSrc && (
        <div className={`${styles.placeholder} ${styles.loading}`}>
          <img
            src={placeholderSrc}
            alt=""
            style={imageStyle}
            className={styles.placeholderImage}
          />
        </div>
      )}
    </div>
  );
}; 