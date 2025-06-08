import type { User } from '../models/user';

export class UserUtils {
  private static readonly USER_KEY = 'user';

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  static setUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getUser();
  }
}