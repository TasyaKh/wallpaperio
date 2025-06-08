import { useAuth } from '../../contexts/AuthContext';
import styles from './Home.module.scss';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className={styles.welcomeSection}>
            <h1>Welcome, {user?.name}</h1>
          </div>
          <div className="d-flex gap-3">
            <button onClick={logout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 