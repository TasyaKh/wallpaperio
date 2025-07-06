import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CategoryFilter.module.scss";
import { Category } from "../../../../models/category";
import { categoryIcons } from "../../../../constants/categoryIcons";

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
        className={`${styles.categoryButton} ${!selectedCategory ? styles.active : ""}`}
        onClick={() => onCategoryChange(null)}
      >
        <FontAwesomeIcon icon={categoryIcons["all"]} className={styles.icon} />
        All
      </button>
      {categories.map((category) => {
        const categoryIcon = categoryIcons[category.name.toLowerCase()];
        return (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${selectedCategory === category.name ? styles.active : ""}`}
            onClick={() => onCategoryChange(category.name)}
          >
            {categoryIcon && (
              <FontAwesomeIcon icon={categoryIcon} className={styles.icon} />
            )}
            {category.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
