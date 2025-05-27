
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

export const DarkModeToggle: React.FC = () => {
  // fix: Destructure only 'theme' as 'isDarkMode' and 'toggleDarkMode' are not part of ThemeContextType.
  const { theme } = useTheme();
  // fix: Determine if current mode is dark based on the active theme.
  const isCurrentlyDark = theme.mode === 'dark';

  return (
    // fix: Changed to a div and made non-interactive as toggling is not supported.
    <div
      className="p-2 rounded-full" // Removed hover/focus styles as it's not interactive
      aria-label={isCurrentlyDark ? "Current mode: Dark" : "Current mode: Light"}
      title={isCurrentlyDark ? "Current mode: Dark" : "Current mode: Light"}
    >
      {/* fix: Display icon based on the current theme's mode. Moon for dark, Sun for light. */}
      {isCurrentlyDark ? (
        <MoonIcon className="w-5 h-5 text-[var(--text-accent)]" />
      ) : (
        <SunIcon className="w-5 h-5 text-[var(--text-accent)]" />
      )}
    </div>
  );
};
