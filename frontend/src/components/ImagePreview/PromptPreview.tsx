import React from "react";
import { faEye, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../Buttons/IconButton/IconButton";
import styles from "./PromptPreview.module.scss";

interface PromptPreviewButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const PromptPreviewButton: React.FC<PromptPreviewButtonProps> = ({
  active,
  onClick,
  disabled = false,
  className = "",
}) => (
  <div className={`${className}`}>
    <IconButton
      icon={active ? faEye : faFileAlt}
      onClick={onClick}
      disabled={disabled}
      title={active ? "Hide prompt" : "Show prompt"}
      className={styles.promptButton}
    />
  </div>
);

interface PromptPopupProps {
  prompt?: string;
}

export const PromptPopup: React.FC<PromptPopupProps> = ({ prompt }) => {
  if (!prompt) return null;
  return (
    <div className={styles.promptBottomContainer}>
      <div className={styles.promptContent}>
        <p>{prompt}</p>
      </div>
    </div>
  );
}; 