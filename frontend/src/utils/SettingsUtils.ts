import type { ThemeMode } from "../styles/theme";

class SettingsUtils {
  private static readonly TOKEN_KEY = 'token';
  private static readonly THEME_KEY = 'theme';

  // Token methods
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Theme methods
  static getTheme(): ThemeMode | null {
    return localStorage.getItem(this.THEME_KEY) as ThemeMode;
  }

  static setTheme(theme: ThemeMode): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  // Clear all settings
  static clearAll(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.THEME_KEY);
  }
}
export default SettingsUtils;

