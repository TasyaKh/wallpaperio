import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getWallpapers } from '../../api/wallpapers';
import { getCategories } from '../../api/categories';
import styles from './Wallpapers.module.scss';
import { Wallpaper } from '../../models/wallpaper';
import { Category } from '../../models/category';

const ITEMS_PER_PAGE = 12;

export default function Wallpapers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const response = await getWallpapers({
          category: selectedCategory || undefined,
          limit: ITEMS_PER_PAGE,
          offset: 0,
        });
        setWallpapers(response.wallpapers);
        setTotal(response.total);
        setOffset(ITEMS_PER_PAGE);
        setHasMore(response.wallpapers.length < response.total);
      } catch (err) {
        setError('Failed to load wallpapers');
        console.error('Error loading wallpapers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallpapers();
  }, [selectedCategory]);

  const loadMore = async () => {
    try {
      const response = await getWallpapers({
        category: selectedCategory || undefined,
        limit: ITEMS_PER_PAGE,
        offset,
      });
      setWallpapers((prev) => [...prev, ...response.wallpapers]);
      setOffset((prev) => prev + ITEMS_PER_PAGE);
      setHasMore(wallpapers.length + response.wallpapers.length < total);
    } catch (err) {
      console.error('Error loading more wallpapers:', err);
    }
  };

  const handleCategoryChange = (categoryName: string | null) => {
    setSearchParams(categoryName ? { category: categoryName } : {});
  };

  if (loading && wallpapers.length === 0) {
    return <div className={styles.loading}>Loading wallpapers...</div>;
  }

  if (error && wallpapers.length === 0) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.wallpapers}>
      <div className={styles.categories}>
        <button
          className={`${styles.categoryButton} ${!selectedCategory ? styles.active : ''}`}
          onClick={() => handleCategoryChange(null)}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${selectedCategory === category.name ? styles.active : ''}`}
            onClick={() => handleCategoryChange(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <InfiniteScroll
        dataLength={wallpapers.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className={styles.loading}>Loading more...</div>}
        endMessage={
          <p className={styles.endMessage}>
            {wallpapers.length > 0 ? "You've seen all wallpapers!" : 'No wallpapers found.'}
          </p>
        }
      >
        <div className={styles.grid}>
          {wallpapers.map((wallpaper) => (
            <div key={wallpaper.id} className={styles.wallpaperCard}>
              <img src={wallpaper.image_url} alt={wallpaper.title} />
              <div className={styles.overlay}>
                <div className={styles.tags}>
                  {wallpaper.tags.map((tag) => (
                    <span key={tag.id} className={styles.tag}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
} 