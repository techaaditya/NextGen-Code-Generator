
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { AppTheme, ThemeColors } from '../types';
import { THEMES, DEFAULT_THEME_ID } from '../constants';

interface ThemeContextType {
  theme: AppTheme; // This will be the effectively active theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // The application will now always use the single defined theme.
  const activeTheme = THEMES.find(t => t.id === DEFAULT_THEME_ID)!;

  const applyThemeColors = useCallback((colors: ThemeColors, effectiveMode: 'light' | 'dark') => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Special handling for scrollbar styles
    let scrollbarStyleTag = document.getElementById('dynamic-scrollbar-styles');
    if (!scrollbarStyleTag) {
        scrollbarStyleTag = document.createElement('style');
        scrollbarStyleTag.id = 'dynamic-scrollbar-styles';
        document.head.appendChild(scrollbarStyleTag);
    }
    scrollbarStyleTag.textContent = `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${colors['--scrollbar-track']}; }
        ::-webkit-scrollbar-thumb { background: ${colors['--scrollbar-thumb']}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors['--scrollbar-thumb-hover']}; }
    `;
    
    // For selection
    let selectionStyleTag = document.getElementById('dynamic-selection-styles');
    if (!selectionStyleTag) {
        selectionStyleTag = document.createElement('style');
        selectionStyleTag.id = 'dynamic-selection-styles';
        document.head.appendChild(selectionStyleTag);
    }
    selectionStyleTag.textContent = `
      ::selection {
        background-color: ${colors['--selection-bg']};
        color: ${colors['--selection-text']};
      }
      ::-moz-selection { /* Firefox */
        background-color: ${colors['--selection-bg']};
        color: ${colors['--selection-text']};
      }
    `;
    document.documentElement.className = effectiveMode; // 'light' or 'dark'

  }, []);

  useEffect(() => {
    applyThemeColors(activeTheme.colors, activeTheme.mode);
    // No need to manage localStorage for theme settings anymore
  }, [activeTheme, applyThemeColors]);


  return (
    <ThemeContext.Provider value={{ 
      theme: activeTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
