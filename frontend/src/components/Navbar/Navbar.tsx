import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { ThemeMode } from "../../styles/theme";
import { Loader } from "../Loader/Loader";
import styles from "./Navbar.module.scss";
import { Button } from "../Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon } from "@fortawesome/free-regular-svg-icons/faMoon";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { RoleManager } from "../../utils/roles";
import { useEffect, useState } from "react";
import Search from "../Search/Search";

export const Navbar = () => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set("search", query);
    } else {
      newParams.delete("search");
    }

    if (location.pathname.startsWith("/categories")) {
      navigate(`/wallpapers?${newParams.toString()}`);
    } else {
      setSearchParams(newParams);
    }
  };

  const toggleMenu = () => {
    const isOpen = !isMenuOpen;
    if (isOpen) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    setIsMenuOpen(isOpen);
  };

  // Close menu on route change
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.classList.remove("modal-open");
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
        document.body.classList.remove("modal-open");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  const showSearch =
    location.pathname.startsWith("/wallpapers") ||
    location.pathname.startsWith("/categories");

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.svg" alt="WallpaperIO" width="40" height="40" />
        </Link>
        {showSearch && (
          <div className={styles.searchWrapper}>
            <Search
              onSearch={handleSearch}
              initialQuery={searchParams.get("search") ?? ""}
            />
          </div>
        )}
        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon
            icon={isMenuOpen ? faTimes : faBars}
            className={styles.hamburgerIcon}
          />
        </button>

        <div
          className={`${styles.navContent} ${isMenuOpen ? styles.active : ""}`}
        >
          <div className={styles.navLinks}>
            <Link to="/wallpapers">Wallpapers</Link>
            <Link to="/categories">Categories</Link>
            {user && RoleManager.canAccessAdminPanel(user.role) && (
              <Link to="/admin-panel">Admin Panel</Link>
            )}
          </div>

          <div className={styles.navActions}>
            <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              aria-label={`Switch to ${
                theme.mode === ThemeMode.Light ? "dark" : "light"
              } theme`}
            >
              {theme.mode === ThemeMode.Light ? (
                <FontAwesomeIcon icon={faMoon} color="var(--color-primary)" />
              ) : (
                <FontAwesomeIcon icon={faSun} color="var(--color-primary)" />
              )}
            </button>

            {loading ? (
              <Loader size="small" />
            ) : user ? (
              <Link to="/profile">
                <img
                  src={user.profile_pic_url || "/default-avatar.png"}
                  alt={user.name}
                  className={styles.avatar}
                />
              </Link>
            ) : (
              <Button variant="primary">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
