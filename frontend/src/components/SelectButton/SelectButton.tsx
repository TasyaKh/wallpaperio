import React from 'react';
import styles from './SelectButton.module.scss';

interface SelectButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const SelectButton: React.FC<SelectButtonProps> = ({
  label,
  isSelected,
  onClick,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    onClick();
  };

  return (
    <button
      type="button"
      className={`${styles.selectButton} ${isSelected ? styles.selected : ''} ${className}`}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}; 