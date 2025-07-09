import InfiniteScroll from "react-infinite-scroll-component";
import styles from "./WallpapersGrid.module.scss";
import { Wallpaper } from "@/models/wallpaper";
import WallpaperCard from "../WallpaperCard/WallpaperCard";
import { useAuth } from "@/contexts/AuthContext";
import { RoleManager } from "@/utils/roles";

interface WallpapersGridProps {
  wallpapers: Wallpaper[];
  hasMore: boolean;
  loadMore: () => void;
  isDeleting?: boolean;
  onWallpaperClick: (wallpaper: Wallpaper, index: number) => void;
  onDelete?: (id: number) => void;
}

const WallpapersGrid: React.FC<WallpapersGridProps> = ({
  wallpapers,
  hasMore,
  loadMore,
  isDeleting,
  onWallpaperClick,
  onDelete,
}) => {
  const { user } = useAuth();

  return (
    <InfiniteScroll
      dataLength={wallpapers.length}
      next={loadMore}
      hasMore={hasMore}
      loader={<div className={styles.loading}>Loading more...</div>}
      endMessage={
        <div className={styles.endMessage}>
          {wallpapers.length > 0
            ? "You've seen all wallpapers!"
            : "No wallpapers found."}
        </div>
      }
    >
      <div className={styles.grid}>
        {wallpapers.map((wallpaper, idx) => (
          <WallpaperCard
            key={wallpaper.id}
            wallpaper={wallpaper}
            onClick={() => onWallpaperClick(wallpaper, idx)}
            onDelete={
              user && RoleManager.canDeleteWallpapers(user.role)
                ? () => onDelete?.(wallpaper.id)
                : undefined
            }
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default WallpapersGrid;
