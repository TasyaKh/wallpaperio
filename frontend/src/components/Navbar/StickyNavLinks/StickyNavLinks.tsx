import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faHeart, faHome } from "@fortawesome/free-solid-svg-icons";
import styles from "./StickyNavLinks.module.scss";
import { Link } from "react-router-dom";

export const StickyNavLinks = (props) => {
  const stickyRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!stickyRef.current) return;
      
      const currentScrollY = window.scrollY;
      const { top } = stickyRef.current.getBoundingClientRect();
      
      // Check if sticky
      setIsSticky(top <= 0);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current || currentScrollY <= 100) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={stickyRef}
      className={`${styles.stickyNavLinks} ${isSticky ? styles.stuck : ""} ${!isVisible ? styles.hidden : ""}`}
    >
      <Link to="/wallpapers">
        {isSticky && <FontAwesomeIcon icon={faHome} />}{" "}
        <span className={styles.navText}>Wallpapers</span>
      </Link>
      <Link to="/categories">
        {isSticky && <FontAwesomeIcon icon={faImage} />}
        <span className={styles.navText}>Categories</span>
      </Link>
      <Link to="/favorites" onClick={props.handleFavoritesClick}>
        {isSticky && <FontAwesomeIcon icon={faHeart} />}
        <span className={styles.navText}>Favorites</span>
      </Link>
    </div>
  );
};
