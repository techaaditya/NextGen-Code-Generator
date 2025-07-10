
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  // fix: Destructure only 'theme' as 'currentBaseThemeId', 'setBaseThemeById', and 'availableBaseThemes' are not part of ThemeContextType.
  const { theme } = useTheme();

  return (
    <div className="relative">
      <label htmlFor="theme-selector" className="sr-only">Select Theme</label>
      <select
        id="theme-selector"
        // fix: Value should be the current theme's ID.
        value={theme.id}
        // fix: The select is disabled as theme switching is not supported. onChange is not needed.
        disabled
        className="block w-full appearance-none bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-primary)] py-2 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] sm:text-sm cursor-default min-h-[36px]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${encodeURIComponent(theme.colors['--text-secondary'])}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
          backgroundPosition: 'right 0.5rem center', 
          backgroundRepeat: 'no-repeat', 
          backgroundSize: '1.5em 1.5em' 
        }}
      >
        {/* fix: Display only the single active theme as an option. */}
        <option key={theme.id} value={theme.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
          {theme.name}
        </option>
      </select>
    </div>
  );
};
