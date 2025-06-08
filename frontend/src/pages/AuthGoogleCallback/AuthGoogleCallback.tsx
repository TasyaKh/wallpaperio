import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { googleAuthApi } from "../../api/googleAuth";
import SettingsUtils from "../../utils/SettingsUtils";
import { UserUtils } from "../../utils/UserUtils";
import { useAuth } from "../../contexts/AuthContext";

const AuthGoogleCallback = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  const handleCallback = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state") || "";

      if (!code) {
        setError("No authorization code received");
        return;
      }

      const { user, token } = await googleAuthApi.makeGoogleCollback(code, state);
      params.delete("code");
      SettingsUtils.setToken(token);
      UserUtils.setUser(user);
      fetchUser();

      navigate("/wallpapers");
    } catch (err) {
      console.error("Auth callback error:", err);
      setError("Authentication failed. Please try again.");
      setTimeout(() => navigate("/login"), 5000);
    } finally {
      isProcessing.current = false;
    }
  };

  useEffect(() => {
    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Processing authentication...</span>
      </div>
    </div>
  );
};

export default AuthGoogleCallback;
