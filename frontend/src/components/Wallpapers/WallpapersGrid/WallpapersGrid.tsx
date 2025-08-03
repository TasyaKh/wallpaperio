import InfiniteScroll from "react-infinite-scroll-component";
import styles from "./WallpapersGrid.module.scss";
import { Wallpaper } from "@/models/wallpaper";
import WallpaperCard from "../WallpaperCard/WallpaperCard";
import { useAuth } from "@/contexts/AuthContext";
import { RoleManager } from "@/utils/roles";
import React, { useEffect, useMemo } from "react";

interface WallpapersGridProps {
  wallpapers: Wallpaper[];
  hasMore: boolean;
  loadMore: () => void;
  isDeleting?: boolean;
  onWallpaperClick: (wallpaper: Wallpaper, index: number) => void;
  onDelete?: (id: number) => void;
}

const getColumnCount = () => {
  if (window.innerWidth <= 300) return 1;
  if (window.innerWidth <= 600) return 2;
  if (window.innerWidth <= 1200) return 3;
  return 4;
};

const splitIntoColumns = (items: Wallpaper[], columnCount: number) => {
  const columns: Wallpaper[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, idx) => {
    columns[idx % columnCount].push(item);
  });
  return columns;
};

const WallpapersGrid: React.FC<WallpapersGridProps> = ({
  wallpapers,
  hasMore,
  loadMore,
  isDeleting,
  onWallpaperClick,
  onDelete,
}) => {
  const [columnCount, setColumnCount] = React.useState(getColumnCount());

  useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columns = useMemo(
    () => splitIntoColumns(wallpapers, columnCount),
    [wallpapers, columnCount]
  );

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
        {columns.map((column, colIdx) => (
          <div className={styles.column} key={`column-${colIdx}`}>
            {column.map((wallpaper, idx) => {
              const globalIdx = colIdx + idx * columnCount;
              return (
                <React.Fragment key={`${wallpaper.id}`}>
                  <WallpaperCard
                    wallpaper={wallpaper}
                    onClick={() => onWallpaperClick(wallpaper, globalIdx)}
                    onDelete={
                      user && RoleManager.canDeleteWallpapers(user.role)
                        ? () => onDelete?.(wallpaper.id)
                        : undefined
                    }
                    isDeleting={isDeleting}
                  />
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default WallpapersGrid;
