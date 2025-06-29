import React from 'react';
import styles from './Badge.module.scss';

interface BadgeProps {
  label: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
}) => {
  return (
    <span className={`${styles.badge} `}>
      {label}
    </span>
  );
}; 