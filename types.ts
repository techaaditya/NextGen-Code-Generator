export interface LanguageOption {
  value: string;
  label: string;
}

export interface ProjectTypeOption {
  value: 'snippet' | 'portfolio' | 'api_endpoint' | 'ui_component' | 'unit_test' | 'db_schema' | 'data_structure_algo' | 'code_explanation' | 'regex_generation' | 'automation_script';
  label: string;
  requiresLanguage: boolean;
  defaultLanguage?: string;
}

export interface PortfolioFileContent {
  html_content: string;
  css_content: string;
  javascript_content: string;
}

export interface PortfolioOutput {
  html: string;
  css: string;
  javascript:string;
}

export interface ThemeColors {
  '--bg-primary': string;
  '--bg-secondary': string;
  '--bg-tertiary': string;
  '--bg-interactive': string; // For interactive elements backgrounds like select
  '--text-primary': string;
  '--text-secondary': string;
  '--text-accent': string;
  '--text-on-accent': string;
  '--border-primary': string;
  '--border-secondary': string; // For less prominent borders
  '--accent-primary': string;
  '--accent-primary-hover': string;
  '--accent-secondary': string;
  '--accent-secondary-hover': string;
  '--accent-success': string;
  '--accent-error': string;
  '--scrollbar-track': string;
  '--scrollbar-thumb': string;
  '--scrollbar-thumb-hover': string;
  '--code-bg': string; // Background for code blocks
  '--selection-bg': string;
  '--selection-text': string;
}

export interface AppTheme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

export interface ExamplePromptItem {
  text: string;
  language?: LanguageOption['value'];
  projectType: ProjectTypeOption['value'];
}

export interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string | null;
  isLoading: boolean;
  language: string;
}