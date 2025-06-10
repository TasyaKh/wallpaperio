import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Theme } from '../styles/theme';
import { ThemeMode, lightTheme, darkTheme } from '../styles/theme';
import SettingsUtils from '../utils/SettingsUtils';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialTheme = (): Theme => {
    const savedTheme = SettingsUtils.getTheme();
    if (savedTheme === ThemeMode.Dark || savedTheme === ThemeMode.Light) {
      return savedTheme === ThemeMode.Dark ? darkTheme : lightTheme;
    }
    
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    SettingsUtils.setTheme(theme.mode);
    
    document.documentElement.setAttribute('data-theme', theme.mode);
  }, [theme.mode]);

  const toggleTheme = () => {
    setThemeState(prevTheme => 
      prevTheme.mode === ThemeMode.Light ? darkTheme : lightTheme
    );
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode === ThemeMode.Light ? lightTheme : darkTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 