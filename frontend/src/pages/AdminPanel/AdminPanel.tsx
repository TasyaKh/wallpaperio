import React from 'react';
import { ImageGenerator } from './components/ImageGenerator';
import styles from './AdminPanel.module.scss';

const AdminPanel: React.FC = () => {
  return (
    <div className={styles.adminPanel}>
      <h1>Admin Panel</h1>
      <ImageGenerator />
    </div>
  );
};

export default AdminPanel; 