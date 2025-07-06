import React from 'react';
import styles from './TagsDisplay.module.scss';
import { Badge } from '../Badges/Badge/Badge';

interface TagsDisplayProps {
  tags: Array<{ id: number; name: string }>;
}

export const TagsDisplay: React.FC<TagsDisplayProps> = ({ tags }) => {

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={styles.tagsContainer}>
      {tags.map((tag) => (
        <Badge key={tag.id} label={tag.name} />
      ))}
    </div>
  );
}; 