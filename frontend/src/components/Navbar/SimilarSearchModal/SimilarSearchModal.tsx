import React, { useRef, useState } from "react";
import { initSimilarSearch } from "@/api/wallpapers";
import { useSimilarSearchStore } from "@/store/similarSearchStore";
import Modal from "../../Modal/Modal";
import { Loader } from "../../Loader/Loader";
import styles from "./SimilarSearchModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";

interface SimilarSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SimilarSearchModal: React.FC<SimilarSearchModalProps> = ({
  open,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setTargetImageSearchKey = useSimilarSearchStore((s) => s.setTargetImageSearchKey);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setLoading(true);
    try {
      // Upload image and get key
      const key = await initSimilarSearch(file);
      setTargetImageSearchKey(key);
      onClose();
      navigate("/similar-wallpapers");
    } catch (err: any) {
      setError(err?.message || "Failed to search similar wallpapers.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <div className="p-4 d-flex flex-column flex-grow-1 align-items-center justify-content-center">
        <h3>Search by Similar Wallpaper</h3>
        <div
          className={
            dragActive
              ? `${styles.dropArea} ${styles.dragActive}`
              : styles.dropArea
          }
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FontAwesomeIcon icon={faImage} className={styles.dropIcon} />
          <div className={styles.dropText}>
            {selectedFile ? (
              <>
                <div style={{ marginBottom: 8 }}>Selected:</div>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="preview"
                  style={{
                    maxWidth: 120,
                    maxHeight: 120,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
                <div>{selectedFile.name}</div>
              </>
            ) : (
              <>
                Drag & drop an image here, or{" "}
                <span
                  style={{
                    color: "#007bff",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  click to upload
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
        {loading && <Loader text="Searching..." />}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </Modal>
  );
};

export default SimilarSearchModal;
