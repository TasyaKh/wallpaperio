import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../Button/Button';
import styles from './TagManager.module.scss';

interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ tags, onTagsChange }) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={styles.tagManager}>
      <h4>Tags</h4>
      <div className={styles.tagInput}>
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new tag..."
        />
        <Button
          variant="secondary"
          onClick={handleAddTag}
          disabled={!newTag.trim()}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
      <div className={styles.tagList}>
        {tags.map((tag) => (
          <div key={tag} className={styles.tag}>
            <span>{tag}</span>
            <button
              className={styles.removeTag}
              onClick={() => handleRemoveTag(tag)}
              aria-label={`Remove ${tag} tag`}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 