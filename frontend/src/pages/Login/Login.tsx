import { GoogleLoginButton } from "./components/GoogleLoginButton/GoogleLoginButton";
import styles from "./Login.module.scss";

const Login = () => {
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 justify-content-center">
        <div className={styles.loginContainer}>
          <h2>Sign in to WallpaperIO</h2>
          <div className={styles.googleButtonContainer}>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
