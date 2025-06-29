import { GoogleLoginButton } from "./components/GoogleLoginButton/GoogleLoginButton";
import styles from "./Login.module.scss";

const Login = () => {
  return (
    <div className="container">
      <div className={styles.centerWrap}>
        <div className={styles.loginContainer}>
          <h2 className="gradient-title">Sign in to WallpaperIO</h2>
          <div className={styles.googleButtonContainer}>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
