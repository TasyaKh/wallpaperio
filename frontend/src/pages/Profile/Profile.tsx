import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Profile.module.scss';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.profile}>
      <div className={styles.content}>
        <h1>Profile</h1>
        <div className={styles.userInfo}>
          <img src={user.profile_pic_url || "/default-avatar.png"} alt={user.name} className={styles.avatar} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
}
