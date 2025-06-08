import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './Loader.module.scss';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export const Loader = ({ size = 'medium', color, className }: LoaderProps) => {
  const loaderColor = color || 'var(--color-primary)';

  return (
    <div className={`${styles.loader} ${styles[size]} ${className || ''}`}>
      <FontAwesomeIcon 
        icon={faSpinner} 
        spin 
        style={{ color: loaderColor }} 
      />
    </div>
  );
}; 