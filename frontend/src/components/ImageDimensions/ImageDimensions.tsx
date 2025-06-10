import React from 'react';
import styles from './ImageDimensions.module.scss';

interface ImageDimensionsProps {
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const ImageDimensions: React.FC<ImageDimensionsProps> = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  min = 256,
  max = 2048,
  step = 64,
}) => {
  return (
    <div className={styles.dimensions}>
      <div className={styles.dimensionField}>
        <label htmlFor="width">Width</label>
        <input
          type="number"
          id="width"
          value={width}
          onChange={(e) => onWidthChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
        />
      </div>
      <div className={styles.dimensionField}>
        <label htmlFor="height">Height</label>
        <input
          type="number"
          id="height"
          value={height}
          onChange={(e) => onHeightChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  );
}; 