import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "./Search.module.scss";

interface SearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const Search = ({ onSearch, initialQuery = "" }: SearchProps) => {
  const [isExpanded, setIsExpanded] = useState(!!initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) {
      setIsExpanded(true);
    }
  }, [initialQuery]);

  const handleSearchClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    } else if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query.trim()) {
      onSearch(query);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value === "") {
      onSearch("");
    }
  };

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div
      className={`${styles.searchContainer} ${isExpanded ? styles.expanded : ""}`}
    >
      <div className={styles.searchIcon} onClick={handleSearchClick}>
        <FontAwesomeIcon icon={faSearch} />
      </div>
      <input
        ref={inputRef}
        type="text"
        className={`${styles.searchInput} ${isExpanded ? styles.visible : ""}`}
        placeholder="Search..."
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default Search;
