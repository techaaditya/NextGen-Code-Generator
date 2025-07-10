import React from 'react';
import { ProjectTypeOption } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ProjectTypeSelectorProps {
  value: ProjectTypeOption['value'];
  onChange: (value: ProjectTypeOption['value']) => void;
  projectTypes: ProjectTypeOption[];
}

export const ProjectTypeSelector: React.FC<ProjectTypeSelectorProps> = ({ value, onChange, projectTypes }) => {
  const { theme } = useTheme();
  return (
    <div>
      <label htmlFor="projectType" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
        Project Type
      </label>
      <select
        id="projectType"
        name="projectType"
        className="block w-full bg-[var(--bg-interactive)] border-[var(--border-primary)] rounded-md shadow-sm focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] sm:text-sm p-3 text-[var(--text-primary)] outline-none transition-colors duration-150 appearance-none min-h-[36px]"
        value={value}
        onChange={(e) => onChange(e.target.value as ProjectTypeOption['value'])}
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${encodeURIComponent(theme.colors['--text-secondary'])}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
          backgroundPosition: 'right 0.5rem center', 
          backgroundRepeat: 'no-repeat', 
          backgroundSize: '1.5em 1.5em' 
        }}
      >
        {projectTypes.map((type) => (
          <option key={type.value} value={type.value} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
};