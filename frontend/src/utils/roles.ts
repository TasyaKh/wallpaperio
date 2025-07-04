export type UserRole = "user" | "admin"; // Add more roles as needed

export interface RolePermissions {
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
  canDeleteWallpapers: boolean;
  // Add more permissions as needed
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  user: {
    canAccessAdminPanel: false,
    canManageUsers: false,
    canManageContent: false,
    canDeleteWallpapers: false,
  },
  admin: {
    canAccessAdminPanel: true,
    canManageUsers: true,
    canManageContent: true,
    canDeleteWallpapers: true,
  },
};

export class RoleManager {
  static hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
    return rolePermissions[role]?.[permission] ?? false;
  }

  static canAccessAdminPanel(role: UserRole): boolean {
    return this.hasPermission(role, 'canAccessAdminPanel');
  }

  static canManageUsers(role: UserRole): boolean {
    return this.hasPermission(role, 'canManageUsers');
  }

  static canManageContent(role: UserRole): boolean {
    return this.hasPermission(role, 'canManageContent');
  }

  static canDeleteWallpapers(role: UserRole): boolean {
    return this.hasPermission(role, 'canDeleteWallpapers');
  }
} 