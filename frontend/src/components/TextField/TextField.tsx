import React from 'react';
import styles from './TextField.module.scss';

export interface TextFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  rows?: number;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  fullWidth = false,
  rows = 4,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.textFieldWrapper} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        className={`${styles.textField} ${error ? styles.error : ''}`}
        rows={rows}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}; 