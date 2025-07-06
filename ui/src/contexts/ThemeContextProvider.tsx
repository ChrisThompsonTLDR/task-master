import React, { useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { applyTheme, getSystemTheme, getInitialTheme } from '../utils/theme';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, rawSetTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [colorTheme, rawSetColorTheme] = useState<ColorTheme>(() => (localStorage.getItem('color-theme') as ColorTheme) || 'orange');
  const [grayShade, rawSetGrayShade] = useState<GrayShade>(() => (localStorage.getItem('gray-shade') as GrayShade) || 'slate');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme, colorTheme, grayShade);
  }, [theme, colorTheme, grayShade]);

  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === 'system') {
        rawSetTheme(e.matches ? 'dark' : 'light');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    localStorage.setItem('theme', newTheme);
    rawSetTheme(newTheme === 'system' ? getSystemTheme() : newTheme);
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    localStorage.setItem('color-theme', newColorTheme);
    rawSetColorTheme(newColorTheme);
  };

  const setGrayShade = (newGrayShade: GrayShade) => {
    localStorage.setItem('gray-shade', newGrayShade);
    rawSetGrayShade(newGrayShade);
  };
  
  const toggleMenu = useCallback(() => setIsMenuOpen(!isMenuOpen), [isMenuOpen]);

  const contextValue = useMemo(() => ({
    theme,
    colorTheme,
    grayShade,
    setTheme,
    setColorTheme,
    setGrayShade,
    isMenuOpen,
    toggleMenu
  }), [theme, colorTheme, grayShade, isMenuOpen, toggleMenu]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}; 