import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../models/user";
import SettingsUtils from "../utils/SettingsUtils";
import { UserUtils } from "../utils/UserUtils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  fetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
