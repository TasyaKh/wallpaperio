// Theme mode enum
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark'
}

// CSS variable names
export const CSS_VARIABLES = {
  // Colors
  primary: '--color-primary',
  primaryDark: '--color-primary-dark',
  primaryLight: '--color-primary-light',
  
  secondary: '--color-secondary',
  secondaryDark: '--color-secondary-dark',
  secondaryLight: '--color-secondary-light',
  
  success: '--color-success',
  successDark: '--color-success-dark',
  successLight: '--color-success-light',
  
  danger: '--color-danger',
  dangerDark: '--color-danger-dark',
  dangerLight: '--color-danger-light',
  
  warning: '--color-warning',
  warningDark: '--color-warning-dark',
  warningLight: '--color-warning-light',
  
  info: '--color-info',
  infoDark: '--color-info-dark',
  infoLight: '--color-info-light',
  
  // Theme
  backgroundPrimary: '--theme-background-primary',
  backgroundSecondary: '--theme-background-secondary',
  backgroundTertiary: '--theme-background-tertiary',
  
  textPrimary: '--theme-text-primary',
  textSecondary: '--theme-text-secondary',
  textMuted: '--theme-text-muted',
  
  borderColor: '--theme-border-color',
  borderRadius: '--theme-border-radius',
  
  // Spacing
  spacingXs: '--spacing-xs',
  spacingSm: '--spacing-sm',
  spacingMd: '--spacing-md',
  spacingLg: '--spacing-lg',
  spacingXl: '--spacing-xl',
  
  // Transitions
  transitionFast: '--transition-fast',
  transitionNormal: '--transition-normal',
  transitionSlow: '--transition-slow',
  
  // Shadows
  shadowSm: '--shadow-sm',
  shadowMd: '--shadow-md',
  shadowLg: '--shadow-lg',
} as const;

// Theme type
export type Theme = {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    
    success: string;
    successDark: string;
    successLight: string;
    
    danger: string;
    dangerDark: string;
    dangerLight: string;
    
    warning: string;
    warningDark: string;
    warningLight: string;
    
    info: string;
    infoDark: string;
    infoLight: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: {
    color: string;
    radius: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
};

// Helper to get CSS variable value
export const getCssVar = (name: keyof typeof CSS_VARIABLES): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(CSS_VARIABLES[name])
    .trim();
};

// Light theme
export const lightTheme: Theme = {
  mode: ThemeMode.Light,
  colors: {
    primary: getCssVar('primary'),
    primaryDark: getCssVar('primaryDark'),
    primaryLight: getCssVar('primaryLight'),
    
    secondary: getCssVar('secondary'),
    secondaryDark: getCssVar('secondaryDark'),
    secondaryLight: getCssVar('secondaryLight'),
    
    success: getCssVar('success'),
    successDark: getCssVar('successDark'),
    successLight: getCssVar('successLight'),
    
    danger: getCssVar('danger'),
    dangerDark: getCssVar('dangerDark'),
    dangerLight: getCssVar('dangerLight'),
    
    warning: getCssVar('warning'),
    warningDark: getCssVar('warningDark'),
    warningLight: getCssVar('warningLight'),
    
    info: getCssVar('info'),
    infoDark: getCssVar('infoDark'),
    infoLight: getCssVar('infoLight'),
  },
  background: {
    primary: getCssVar('backgroundPrimary'),
    secondary: getCssVar('backgroundSecondary'),
    tertiary: getCssVar('backgroundTertiary'),
  },
  text: {
    primary: getCssVar('textPrimary'),
    secondary: getCssVar('textSecondary'),
    muted: getCssVar('textMuted'),
  },
  border: {
    color: getCssVar('borderColor'),
    radius: getCssVar('borderRadius'),
  },
  spacing: {
    xs: getCssVar('spacingXs'),
    sm: getCssVar('spacingSm'),
    md: getCssVar('spacingMd'),
    lg: getCssVar('spacingLg'),
    xl: getCssVar('spacingXl'),
  },
  transitions: {
    fast: getCssVar('transitionFast'),
    normal: getCssVar('transitionNormal'),
    slow: getCssVar('transitionSlow'),
  },
  shadows: {
    sm: getCssVar('shadowSm'),
    md: getCssVar('shadowMd'),
    lg: getCssVar('shadowLg'),
  },
};

// Dark theme
export const darkTheme: Theme = {
  ...lightTheme,
  mode: ThemeMode.Dark,
  background: {
    primary: getCssVar('backgroundPrimary'),
    secondary: getCssVar('backgroundSecondary'),
    tertiary: getCssVar('backgroundTertiary'),
  },
  text: {
    primary: getCssVar('textPrimary'),
    secondary: getCssVar('textSecondary'),
    muted: getCssVar('textMuted'),
  },
  border: {
    color: getCssVar('borderColor'),
    radius: getCssVar('borderRadius'),
  },
};

// Export current theme (can be changed based on user preference)
export const theme = lightTheme;

// Export individual colors for backward compatibility
export const PRIMARY_COLOR = theme.colors.primary;
export const PRIMARY_DARK = theme.colors.primaryDark;
export const PRIMARY_LIGHT = theme.colors.primaryLight;

export const SECONDARY_COLOR = theme.colors.secondary;
export const SECONDARY_DARK = theme.colors.secondaryDark;
export const SECONDARY_LIGHT = theme.colors.secondaryLight;

export const SUCCESS_COLOR = theme.colors.success;
export const SUCCESS_DARK = theme.colors.successDark;
export const SUCCESS_LIGHT = theme.colors.successLight;

export const DANGER_COLOR = theme.colors.danger;
export const DANGER_DARK = theme.colors.dangerDark;
export const DANGER_LIGHT = theme.colors.dangerLight;

export const WARNING_COLOR = theme.colors.warning;
export const WARNING_DARK = theme.colors.warningDark;
export const WARNING_LIGHT = theme.colors.warningLight;

export const INFO_COLOR = theme.colors.info;
export const INFO_DARK = theme.colors.infoDark;
export const INFO_LIGHT = theme.colors.infoLight;

export const LIGHT_COLOR = theme.background.primary;
export const DARK_COLOR = theme.background.tertiary;

export const GRAY_100 = theme.background.secondary;
export const GRAY_200 = theme.background.tertiary;
export const GRAY_300 = theme.border.color;
export const GRAY_400 = theme.text.muted;
export const GRAY_500 = theme.text.secondary;
export const GRAY_600 = theme.text.primary;
export const GRAY_700 = theme.border.color;
export const GRAY_800 = theme.background.primary;
export const GRAY_900 = theme.background.tertiary;

export const TEXT_PRIMARY = theme.text.primary;
export const TEXT_SECONDARY = theme.text.secondary;
export const TEXT_MUTED = theme.text.muted;

export const BG_PRIMARY = theme.background.primary;
export const BG_SECONDARY = theme.background.secondary;
export const BG_DARK = theme.background.tertiary; 