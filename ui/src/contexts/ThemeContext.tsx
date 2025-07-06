import { createContext, useContext } from 'react';

export type ColorTheme = 'orange' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber' | 'cyan' | 'red' | 'indigo' | 'teal' | 'lime' | 'pink' | 'slate' | 'zinc' | 'stone' | 'neutral';
export type GrayShade = 'slate' | 'zinc' | 'stone' | 'neutral';

export interface ThemeContextType {
  theme: 'light' | 'dark';
  colorTheme: ColorTheme;
  grayShade: GrayShade;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setGrayShade: (grayShade: GrayShade) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeContextProvider');
  return context;
}