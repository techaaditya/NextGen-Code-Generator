import React from 'react';
import { LanguageOption } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  languages: LanguageOption[];
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, languages }) => {
  const { theme } = useTheme();
  return (
    <div>
      <label htmlFor="language" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
        Target Language
      </label>
      <select
        id="language"
        name="language"
        className="block w-full bg-[var(--bg-interactive)] border-[var(--border-primary)] rounded-md shadow-sm focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] sm:text-sm p-3 text-[var(--text-primary)] outline-none transition-colors duration-150 appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${encodeURIComponent(theme.colors['--text-secondary'])}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
          backgroundPosition: 'right 0.5rem center', 
          backgroundRepeat: 'no-repeat', 
          backgroundSize: '1.5em 1.5em' 
        }}
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};