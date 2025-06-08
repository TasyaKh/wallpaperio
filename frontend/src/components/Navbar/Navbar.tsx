import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { ThemeMode } from "../../styles/theme";
import { Loader } from "../Loader/Loader";
import styles from "./Navbar.module.scss";
import { Button } from "../Button";

export const Navbar = () => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        WallpaperIO
      </Link>

      <div className="row g-4 ">
        <div className={styles.navLinks}>
          <div className="col-auto align-items-center d-flex">
            <Link to="/wallpapers">Wallpapers</Link>
          </div>
          <div className="col-auto align-items-center d-flex">
            <Link to="/categories">Categories</Link>
          </div>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-auto align-items-center d-flex">
          <button
            onClick={handleThemeToggle}
            className={styles.themeToggle}
            aria-label={`Switch to ${
              theme.mode === ThemeMode.Light ? "dark" : "light"
            } theme`}
          >
            {theme.mode === ThemeMode.Light ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="col-auto align-items-center d-flex">
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
    </nav>
  );
};
