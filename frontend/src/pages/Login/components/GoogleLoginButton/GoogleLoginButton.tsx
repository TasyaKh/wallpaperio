import { useState } from 'react';
import { googleAuthApi } from "../../../../api/googleAuth";
import { Loader } from "../../../../components/Loader/Loader";
import { TEXT_PRIMARY } from "../../../../styles/theme";
import styles from "./GoogleLoginButton.module.scss";

export const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    try {
      setIsLoading(true);
      const authUrl = await googleAuthApi.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={login} 
      className={styles.loginButton}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader size="small" color={TEXT_PRIMARY} />
      ) : (
        <>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className={styles.googleIcon}
          />
          Sign in with Google
        </>
      )}
    </button>
  );
}; 