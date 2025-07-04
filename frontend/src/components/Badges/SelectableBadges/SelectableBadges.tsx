import React, { useState, useEffect } from 'react';
import { SelectButton } from '../../SelectButton/SelectButton';
import styles from './SelectableBadges.module.scss';

interface Props {
  items: string[];
  onSelect?: (item: string) => void;
}

export const SelectableBadges: React.FC<Props> = ({ 
  items,
  onSelect 
}) => {
  const [selectedItem, setSelectedItem] = useState<string>('');

  useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
      onSelect?.(items[0]);
    }
  }, [items, selectedItem, onSelect]);

  if (items.length === 0) {
    return <p>No items available</p>;
  }

  const handleSelect = (item: string) => {
    setSelectedItem(item);
    onSelect?.(item);
  };

  return (
    <div className={styles.selectableList}>
      {items.map((item) => (
        <SelectButton
          key={item}
          label={item}
          isSelected={selectedItem === item}
          onClick={() => handleSelect(item)}
        />
      ))}
    </div>
  );
}; 