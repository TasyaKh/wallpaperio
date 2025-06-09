import React from 'react';
import styles from './CategoryFilter.module.scss';
import { Category } from '../../../../models/category';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className={styles.categories}>
      <button
        className={`${styles.categoryButton} ${!selectedCategory ? styles.active : ''}`}
        onClick={() => onCategoryChange(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`${styles.categoryButton} ${selectedCategory === category.name ? styles.active : ''}`}
          onClick={() => onCategoryChange(category.name)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter; 