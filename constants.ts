
import { LanguageOption, ProjectTypeOption, AppTheme, ExamplePromptItem } from './types';

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'sql', label: 'SQL' }, // Note: SQL is supported as a language, but db_schema project type doesn't use the selector.
  { value: 'shell', label: 'Shell Script' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'rust', label: 'Rust' },
];

export const DEFAULT_LANGUAGE: string = 'python'; 

export const PROJECT_TYPES: ProjectTypeOption[] = [
  { value: 'snippet', label: 'Single Code Snippet', requiresLanguage: true, defaultLanguage: 'python' },
  { value: 'portfolio', label: 'Developer Portfolio Website', requiresLanguage: false },
  { value: 'api_endpoint', label: 'API Endpoint (Backend)', requiresLanguage: true, defaultLanguage: 'javascript' },
  { value: 'ui_component', label: 'UI Component (Frontend)', requiresLanguage: true, defaultLanguage: 'javascript' },
  { value: 'unit_test', label: 'Unit Test Generation', requiresLanguage: true, defaultLanguage: 'javascript' },
  { value: 'db_schema', label: 'Database Schema (SQL)', requiresLanguage: false }, 
  { value: 'automation_script', label: 'Automation Script', requiresLanguage: true, defaultLanguage: 'python' },
  { value: 'regex_generation', label: 'Regular Expression Generation', requiresLanguage: false },
];

export const DEFAULT_PROJECT_TYPE: ProjectTypeOption['value'] = 'snippet'; 

export const PORTFOLIO_LANGUAGES = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
};
export type PortfolioLanguageKey = keyof typeof PORTFOLIO_LANGUAGES;

export const EXAMPLE_PROMPTS: ExamplePromptItem[] = [
  // Snippets (require language)
  { text: "Create a Python function to check if a string is a palindrome.", language: 'python', projectType: 'snippet' },
  { text: "How to reverse a singly linked list in Java?", language: 'java', projectType: 'snippet' },
  { text: "Generate a random hex color code in JavaScript.", language: 'javascript', projectType: 'snippet' },
  { text: "Python function to sort a list of dictionaries by a specific key.", language: 'python', projectType: 'snippet'},
  { text: "JavaScript function that fetches data from an API and logs the title.", language: 'javascript', projectType: 'snippet' },
  { text: "JavaScript code to implement a debounce function.", language: 'javascript', projectType: 'snippet' },
  { text: "Generate a TypeScript interface for a User object with name, id, and email.", language: 'typescript', projectType: 'snippet' },
  { text: "Write a Java method to calculate the factorial of a number.", language: 'java', projectType: 'snippet' },
  { text: "C# method to encrypt a string using AES and return base64.", language: 'csharp', projectType: 'snippet' },
  { text: "PHP script to validate an email address format.", language: 'php', projectType: 'snippet' },
  { text: "Ruby function to count word occurrences in a string.", language: 'ruby', projectType: 'snippet' },
  { text: "Swift function to format a date object into 'YYYY-MM-DD' string.", language: 'swift', projectType: 'snippet' },
  { text: "Kotlin function to find the median of a list of integers.", language: 'kotlin', projectType: 'snippet' },
  { text: "Rust program to read a file and count its lines.", language: 'rust', projectType: 'snippet' },
  { text: "C++ function to implement a binary search algorithm on a sorted vector.", language: 'cpp', projectType: 'snippet' },
  { text: "SQL query to select all columns from a table named 'Customers'.", language: 'sql', projectType: 'snippet' }, // Using snippet for a raw SQL query

  // Automation Scripts (require language)
  { text: "Python script to scrape the titles of the latest articles from a news website's homepage.", language: 'python', projectType: 'automation_script' },
  { text: "Shell script to find all '.log' files modified in the last 24 hours in the current directory.", language: 'shell', projectType: 'automation_script' },
  { text: "Python script to organize files in a directory by their extension.", language: 'python', projectType: 'automation_script'},

  // UI Components (require language)
  { text: "Design a responsive navigation bar using HTML and CSS.", language: 'html', projectType: 'ui_component' }, // HTML provides structure, CSS within would style
  { text: "CSS for a sticky footer that stays at the bottom of the viewport.", language: 'css', projectType: 'ui_component' },
  { text: "HTML structure for a basic contact form with name, email, and message fields.", language: 'html', projectType: 'ui_component' },
  { text: "Create a simple loading spinner animation using only CSS.", language: 'css', projectType: 'ui_component' },
  { text: "Develop a React component for a simple counter with increment/decrement buttons.", language: 'javascript', projectType: 'ui_component' }, // JS for React/JSX
  { text: "TypeScript (TSX) code for an accessible modal dialog component in React.", language: 'typescript', projectType: 'ui_component' },
  { text: "SwiftUI view for a user profile screen with an avatar and name.", language: 'swift', projectType: 'ui_component' },
  
  // API Endpoints (require language)
  { text: "Build a simple Express.js API endpoint for a POST request to '/users'.", language: 'javascript', projectType: 'api_endpoint' },
  { text: "Python Flask API endpoint to get user details by ID.", language: 'python', projectType: 'api_endpoint' },
  { text: "Java Spring Boot controller method for a REST API GET endpoint.", language: 'java', projectType: 'api_endpoint' },
  { text: "Ruby on Rails controller action to display a list of products in JSON format.", language: 'ruby', projectType: 'api_endpoint' },

  // Unit Tests (require language)
  { text: "Generate Jest unit tests for a JavaScript function that sorts an array of numbers.", language: 'javascript', projectType: 'unit_test' },
  { text: "PyTest unit tests for a Python class that manages a shopping cart.", language: 'python', projectType: 'unit_test' },
  { text: "JUnit tests for a Java utility method that validates email addresses.", language: 'java', projectType: 'unit_test' },

  // Project Types NOT requiring language (language property omitted)
  { text: "Create SQL DDL for a 'Products' table with id, name, price, and created_at columns.", projectType: 'db_schema' },
  { text: "Database schema for a blogging platform: Users, Posts, Comments tables with relationships.", projectType: 'db_schema' },
  
  { text: "Generate a regular expression to validate an email address.", projectType: 'regex_generation' },
  { text: "Regex to extract all URLs (http, https, ftp) from a block of text.", projectType: 'regex_generation' },
  { text: "Regex to match standard US phone numbers.", projectType: 'regex_generation'},
  
  { text: "Generate a complete portfolio website for a freelance web developer specializing in React.", projectType: 'portfolio'},
  { text: "Design a minimalist portfolio site for a UX designer.", projectType: 'portfolio'},
];


export const THEMES: AppTheme[] = [
  {
    id: 'vintage-retro',
    name: 'Vintage Retro',
    mode: 'light',
    colors: {
      '--bg-primary': '#FDF6E3',   
      '--bg-secondary': '#F5EEDA', 
      '--bg-tertiary': '#E8DAC9',  
      '--bg-interactive': '#E8DAC9',
      '--text-primary': '#586E75',   
      '--text-secondary': '#839496', 
      '--text-accent': '#B58900',    
      '--text-on-accent': '#FDF6E3',
      '--border-primary': '#D1C7B7', 
      '--border-secondary': '#C7BDB0',
      '--accent-primary': '#268BD2',   
      '--accent-primary-hover': '#1E6A9E',
      '--accent-secondary': '#CB4B16', 
      '--accent-secondary-hover': '#A53B0F',
      '--accent-success': '#859900',   
      '--accent-error': '#DC322F',    
      '--scrollbar-track': '#F5EEDA',
      '--scrollbar-thumb': '#D1C7B7',
      '--scrollbar-thumb-hover': '#B58900',
      '--code-bg': '#F5EEDA', 
      '--selection-bg': '#268BD2',
      '--selection-text': '#FDF6E3',
    },
  },
];

export const DEFAULT_THEME_ID = THEMES[0].id;
    