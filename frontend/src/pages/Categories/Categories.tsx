import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "@/api/categories";
import { Category } from "@/models/category";
import styles from "./Categories.module.scss";
import { Loader } from "@/components/Loader/Loader";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError("Failed to load categories");
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/wallpapers?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return <Loader text="Loading categories..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className="container">
      <div className={styles.categories}>
        <h2 className="gradient-title">Categories</h2>
        <div className={styles.grid}>
          {categories.map((category) => (
            <div
              key={category.id}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className={styles.imageContainer}>
                {category.image_url && (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className={styles.categoryImage}
                  />
                )}
              </div>
              <div className={styles.content}>
                <h2>{category.name}</h2>
                <p>{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
