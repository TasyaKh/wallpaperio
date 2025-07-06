import React from 'react';
import { ImageGenerator } from './components/ImageGenerator';
import styles from './AdminPanel.module.scss';

const AdminPanel: React.FC = () => {
  return (
    <div className="container">
      <div className={styles.adminPanel}>
        <h2>Admin Panel</h2>
        <ImageGenerator />
      </div>
    </div>
  );
};

export default AdminPanel; 