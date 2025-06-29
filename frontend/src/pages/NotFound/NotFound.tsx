import React, { useState } from "react";
import styles from "./NotFound.module.scss";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/wallpapers?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="container">
      <div className={styles.notFoundContainer}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>Oops! Page not found.</p>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search wallpapers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
        <div className={styles.links}>
          <a href="/wallpapers">Go to Wallpapers</a>
          <a href="/categories">Browse Categories</a>
          <a href="/">Home</a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
