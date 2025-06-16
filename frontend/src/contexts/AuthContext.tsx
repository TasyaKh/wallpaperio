import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../models/user";
import SettingsUtils from "../utils/SettingsUtils";
import { UserUtils } from "../utils/UserUtils";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  fetchUser: () => void;
}

interface DecodedToken {
  exp: number;
  user_id: number;
  email: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = () => {
    const token = SettingsUtils.getToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      console.log(
        'Token expiration check:',
        {
          currentTime: new Date(currentTime * 1000).toISOString(),
          expirationTime: new Date(decoded.exp * 1000).toISOString(),
          isExpired: decoded.exp < currentTime
        }
      );

      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  const fetchUser = () => {
    setUser(UserUtils.getUser());
    setLoading(false);
  };

  const logout = () => {
    SettingsUtils.clearToken();
    UserUtils.clearUser();
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      if (isTokenExpired()) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTokenInterval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
