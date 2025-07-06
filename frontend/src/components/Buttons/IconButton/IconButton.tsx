import React from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader } from "../../Loader/Loader";
import styles from "./IconButton.module.scss";

interface IconButtonProps {
  icon: IconDefinition;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  title,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
}) => (
  <button
    type={type}
    className={`${styles.iconBtn} ${className} ${loading ? styles.loading : ""}`}
    onClick={onClick}
    disabled={disabled || loading}
    title={title}
  >
    {loading ? (
      <Loader size="small" />
    ) : (
      <FontAwesomeIcon icon={icon} />
    )}
  </button>
);

export default IconButton;
