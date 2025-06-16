import React from 'react';
import styles from './BaseButton.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  const buttonClass = `${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`;
  
  return (
    <button
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  );
}; 