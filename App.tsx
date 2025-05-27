import React, { useState, useCallback, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { LanguageSelector } from './components/LanguageSelector';
import { ProjectTypeSelector } from './components/ProjectTypeSelector';
import { CodeDisplay } from './components/CodeDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { GeminiService } from './services/GeminiService';
import { ExplanationModal } from './components/ExplanationModal';
import { 
  SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, GEMINI_MODEL_NAME, 
  PROJECT_TYPES, DEFAULT_PROJECT_TYPE, PORTFOLIO_LANGUAGES, PortfolioLanguageKey
} from './constants';
import { SparklesIcon, EyeIcon, ExpandIcon, CompressIcon } from './components/Icons';
import { ProjectTypeOption, PortfolioOutput, PortfolioFileContent, ExamplePromptItem } from './types';
import { useTheme } from './contexts/ThemeContext';


// Helper to attempt parsing JSON, potentially cleaning it from markdown fences
function extractAndParseJson(jsonString: string): PortfolioFileContent {
  let parsableString = jsonString.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = parsableString.match(fenceRegex);
  if (match && match[1]) {
    parsableString = match[1].trim();
  }
  if (!parsableString) { 
      console.error("JSON content is empty after removing markdown fences. Original string:", jsonString);
      throw new Error("The AI's response for portfolio data was empty after processing.");
  }
  try {
    const parsed = JSON.parse(parsableString);
    if (typeof parsed !== 'object' || parsed === null ||
        typeof parsed.html_content !== 'string' || 
        typeof parsed.css_content !== 'string' || 
        typeof parsed.javascript_content !== 'string') {
      console.error("Parsed JSON does not match expected PortfolioFileContent structure. Parsed:", parsed, "Original string:", jsonString);
      throw new Error("Parsed JSON does not match expected PortfolioFileContent structure.");
    }
    return parsed as PortfolioFileContent;
  } catch (e: any) {
    console.error("Failed to parse JSON response from AI:", e.message, "Parsable string attempt:", parsableString, "Original string:", jsonString);
    throw new Error(`The AI's response was not valid JSON or did not match the expected structure. Details: ${e.message}`);
  }
}

function isLivePreviewMeaningful(projectType: ProjectTypeOption['value'], language: string): boolean {
  const lang = language.toLowerCase();

  if (projectType === 'portfolio') return true;

  if (projectType === 'ui_component') {
    return ['html', 'css', 'javascript', 'typescript'].includes(lang);
  }

  if (projectType === 'snippet') {
    return ['html', 'css', 'javascript', 'typescript', 'python'].includes(lang);
  }

  if (projectType === 'automation_script') {
    // Only Python automation scripts get a Pyodide preview
    return lang === 'python'; 
  }
  
  // Other project types like 'api_endpoint', 'unit_test', 'db_schema', 'regex_generation'
  // do not have a meaningful interactive browser live preview.
  return false;
}


const App: React.FC = () => {
  const { theme } = useTheme(); 
  const [prompt, setPrompt] = useState<string>('');
  
  const [projectTypeVal, setProjectTypeVal] = useState<ProjectTypeOption['value']>(DEFAULT_PROJECT_TYPE);
  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE);
  
  const [userOverriddenProjectType, setUserOverriddenProjectType] = useState<boolean>(false);
  const [userOverriddenLanguage, setUserOverriddenLanguage] = useState<boolean>(false);

  const [generatedCode, setGeneratedCode] = useState<string>(''); 
  const [portfolioOutput, setPortfolioOutput] = useState<PortfolioOutput | null>(null);
  const [activePortfolioTab, setActivePortfolioTab] = useState<PortfolioLanguageKey>('html');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);

  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [isExplainingCode, setIsExplainingCode] = useState<boolean>(false);

  const selectedProjectType = PROJECT_TYPES.find(pt => pt.value === projectTypeVal) || PROJECT_TYPES[0];

  const handlePromptTextChange = useCallback((newPrompt: string, sourceExample?: ExamplePromptItem) => {
    setPrompt(newPrompt);

    if (sourceExample) { // User pressed Tab or selected an example
      setProjectTypeVal(sourceExample.projectType);
      const projectTypeDef = PROJECT_TYPES.find(pt => pt.value === sourceExample.projectType);
      if (projectTypeDef?.requiresLanguage) {
        if (sourceExample.language && SUPPORTED_LANGUAGES.some(l => l.value === sourceExample.language)) {
          setLanguage(sourceExample.language);
        } else {
          setLanguage(projectTypeDef.defaultLanguage || DEFAULT_LANGUAGE);
        }
      }
      // An example was explicitly chosen, so reset override flags.
      // Future example placeholder changes in PromptInput should be able to update selectors
      // until the user manually interacts with a selector again, or the input is emptied.
      setUserOverriddenLanguage(false);
      setUserOverriddenProjectType(false);
    }
    // If user is just typing (sourceExample is undefined), DO NOT change userOverridden flags.
    // Their previous manual selections (if any) or example-driven settings should persist
    // until they manually change a selector or accept a new example.
  }, []); // Dependencies are stable setters or constants from imports.


  const handleExamplePromptUpdate = useCallback((example: ExamplePromptItem) => {
    // This function is called when the placeholder example in PromptInput changes AND prompt input is empty.
    // It should update the project type/language selectors *only if* the user has NOT
    // manually overridden them since the last time an example was *accepted* or the page loaded/input cleared.
    if (!userOverriddenProjectType) {
      setProjectTypeVal(example.projectType);
    }
  
    const effectiveProjectTypeVal = userOverriddenProjectType ? projectTypeVal : example.projectType;
    const projectTypeDef = PROJECT_TYPES.find(pt => pt.value === effectiveProjectTypeVal);
  
    if (projectTypeDef?.requiresLanguage) {
      if (!userOverriddenLanguage) {
        if (example.language && SUPPORTED_LANGUAGES.some(l => l.value === example.language)) {
          setLanguage(example.language);
        } else {
          setLanguage(projectTypeDef.defaultLanguage || DEFAULT_LANGUAGE);
        }
      }
    }
  }, [userOverriddenProjectType, userOverriddenLanguage, projectTypeVal]);


  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    setUserOverriddenLanguage(true);
  }, []);

  const handleProjectTypeChange = useCallback((newProjectType: ProjectTypeOption['value']) => {
    setProjectTypeVal(newProjectType);
    setUserOverriddenProjectType(true);
    
    // When project type changes, language might need to reset to its default if not overridden for the new type.
    // Or, reset the language override flag so the new project type's default language can take effect if appropriate.
    setUserOverriddenLanguage(false); 
    
    const projectTypeDef = PROJECT_TYPES.find(pt => pt.value === newProjectType);
    if (projectTypeDef?.requiresLanguage) {
        setLanguage(projectTypeDef.defaultLanguage || DEFAULT_LANGUAGE);
    }

  }, []);


  const stripMarkdownCodeBlock = useCallback((code: string): string => {
    const fenceRegex = /^```(?:\w+)?\s*\n?(.*?)\n?\s*```$/s;
    const match = code.trim().match(fenceRegex);
    if (match && match[1]) {
      return match[1].trim();
    }
    if (code.startsWith('```') && code.endsWith('```')) {
        const lines = code.split('\n');
        if (lines.length > 1) {
             return lines.slice(1, lines.length -1).join('\n').trim();
        } else if (lines.length === 1) {
            return code.substring(3, code.length - 3).trim();
        }
    }
    return code.trim();
  }, []);

  const handleGenerateCode = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedCode('');
    setPortfolioOutput(null);
    setExplanationText(null); 
    setPreviewHtml(null); // Reset preview HTML at the start

    try {
      const serviceResponse = await GeminiService.generate(
        prompt,
        selectedProjectType.value,
        selectedProjectType.requiresLanguage ? language : undefined
      );

      let newPreviewHtmlContent: string | null = null;
      const iframeBg = theme.colors['--bg-secondary'];
      const iframeText = theme.colors['--text-primary'];
      const iframeConsoleBg = theme.colors['--bg-tertiary']; 
      const iframeBorder = theme.colors['--border-secondary'];
      
      const effectiveLanguageForPreview = selectedProjectType.value === 'db_schema' 
        ? 'sql' 
        : (selectedProjectType.requiresLanguage ? language : 'plaintext');

      if (selectedProjectType.value === 'portfolio') {
        const rawPortfolioContent = typeof serviceResponse === 'string' 
          ? extractAndParseJson(serviceResponse) 
          : serviceResponse as PortfolioFileContent;

        const currentPortfolioOutput = {
            html: stripMarkdownCodeBlock(rawPortfolioContent.html_content),
            css: stripMarkdownCodeBlock(rawPortfolioContent.css_content),
            javascript: stripMarkdownCodeBlock(rawPortfolioContent.javascript_content),
        };
        setPortfolioOutput(currentPortfolioOutput);
        setActivePortfolioTab('html');
        // Portfolio always has a meaningful preview
        if (isLivePreviewMeaningful(selectedProjectType.value, 'html')) { 
            newPreviewHtmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Portfolio Preview</title><style>${currentPortfolioOutput.css}</style></head><body style="background-color:${iframeBg}; color:${iframeText};">${currentPortfolioOutput.html}<script>${currentPortfolioOutput.javascript.replace(/<\/script>/gi, '<\\/script>')}<\/script></body></html>`;
        }
      } else { 
        const cleanedCode = stripMarkdownCodeBlock(serviceResponse as string);
        setGeneratedCode(cleanedCode);
        
        const lowerCaseLanguage = effectiveLanguageForPreview.toLowerCase();
        
        if (cleanedCode && isLivePreviewMeaningful(selectedProjectType.value, lowerCaseLanguage)) {
            if (lowerCaseLanguage === 'html') {
                newPreviewHtmlContent = cleanedCode;
            } else if (lowerCaseLanguage === 'css') {
                newPreviewHtmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>CSS Preview</title><style>${cleanedCode}</style></head><body style="background-color:${iframeBg}; color:${iframeText};"><h1>Heading 1</h1><p>This is a paragraph. <a href="#">A link</a>.</p><button>Button</button><ul><li>Item 1</li><li>Item 2</li></ul></body></html>`;
            } else if (lowerCaseLanguage === 'javascript') {
                newPreviewHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JS Live Preview</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; color: ${iframeText}; background-color: ${iframeBg}; }
        #app { padding: 15px; border-bottom: 1px solid ${iframeBorder}; flex-grow: 1; overflow-y: auto; }
        #app:empty::before { content: "DOM output from your script will appear here."; color: #999; font-style: italic; }
        #console-output-container { flex-shrink: 0; max-height: 50%; overflow-y: auto; border-top: 1px solid ${iframeBorder}; background-color: ${iframeConsoleBg}; }
        #console-output-container h4 { margin: 8px 12px 5px; font-size: 0.9em; color: ${iframeText}; opacity: 0.8; font-weight: 600; }
        #console-output { padding: 0 12px 8px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 0.85em; line-height: 1.4; }
        .console-log { color: ${iframeText}; opacity: 0.9; }
        .console-error { color: #D32F2F; font-weight: bold; }
        .console-warn { color: #FF8F00; }
        .console-info { color: #0277BD; }
        pre { margin: 0 0 3px 0; white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <div id="app"></div>
    <div id="console-output-container">
      <h4>Console Output:</h4>
      <div id="console-output"></div>
    </div>
    <script>
        (function() {
            const consoleOutputDiv = document.getElementById('console-output');
            const appDiv = document.getElementById('app');
            if (!consoleOutputDiv || !appDiv) {
                console.error("Preview setup failed: essential divs not found.");
                return;
            }
            const originalConsole = { log: console.log.bind(console), error: console.error.bind(console), warn: console.warn.bind(console), info: console.info.bind(console) };
            function formatArg(arg) {
                if (arg instanceof Error) { return arg.stack || arg.toString(); }
                if (typeof arg === 'object' && arg !== null) { try { return JSON.stringify(arg, null, 2); } catch (e) { return String(arg); } }
                return String(arg);
            }
            function logToDiv(type, args) {
                const message = Array.from(args).map(formatArg).join(' ');
                const pre = document.createElement('pre');
                pre.className = 'console-' + type;
                pre.textContent = message;
                consoleOutputDiv.appendChild(pre);
                if(consoleOutputDiv.parentElement) { consoleOutputDiv.parentElement.scrollTop = consoleOutputDiv.parentElement.scrollHeight; }
            }
            console.log = function(...args) { originalConsole.log(...args); logToDiv('log', args); };
            console.error = function(...args) { originalConsole.error(...args); logToDiv('error', args); };
            console.warn = function(...args) { originalConsole.warn(...args); logToDiv('warn', args); };
            console.info = function(...args) { originalConsole.info(...args); logToDiv('info', args); };
            window.addEventListener('error', function(event) {
                const errorArgs = ['Uncaught Error:'];
                if (event.message) errorArgs.push(event.message);
                if (event.filename) errorArgs.push('at ' + event.filename.substring(event.filename.lastIndexOf('/') + 1) + ':' + event.lineno + ':' + event.colno);
                logToDiv('error', errorArgs);
                originalConsole.error('Uncaught Error:', event.message, event.filename, event.lineno, event.colno, event.error);
                event.preventDefault();
            });
            window.addEventListener('unhandledrejection', function(event) { logToDiv('error', ['Unhandled Promise Rejection:', event.reason]); originalConsole.error('Unhandled Promise Rejection:', event.reason); event.preventDefault(); });
        })();
    <\/script>
    <script> try { ${cleanedCode.replace(/<\/script>/gi, '<\\/script>')} } catch (e) { console.error(e); } <\/script>
</body></html>`;
            } else if (lowerCaseLanguage === 'python') {
                 newPreviewHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python Live Preview</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; background-color: ${iframeBg}; color: ${iframeText}; }
        #output-container { padding: 15px; flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column;}
        #output-container h4 { margin: 0 0 8px; font-size: 0.9em; color: ${iframeText}; opacity: 0.8; font-weight: 600; }
        .output-area { padding: 8px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 0.85em; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; border-radius: 4px; margin-bottom: 10px; background-color: ${iframeConsoleBg}; border: 1px solid ${iframeBorder}; min-height: 50px;}
        #python-output:empty::before { content: "Python script stdout will appear here."; color: #999; font-style: italic; }
        #python-error { color: #D32F2F; } 
        #python-error:empty::before { content: "Python script stderr will appear here if any errors occur."; color: #999; font-style: italic; }
        #loader { text-align: center; padding: 20px; font-style: italic; color: ${iframeText}; opacity: 0.7;}
    </style>
    <script type="text/javascript">
        let userPythonCode = decodeURIComponent("${encodeURIComponent(cleanedCode)}");
        // The line below was removed as encodeURIComponent/decodeURIComponent already handles safe embedding.
        // userPythonCode = userPythonCode.replace(/<\\/script>/gi, '<\\\\/script>'); 
        
        let pyodideInstance = null;
        let domElements = {};

        function onPyodideError(errorMessage) {
            const errorMsg = errorMessage || 'Failed to load Pyodide script from CDN. Python preview will not work.';
            console.error(errorMsg); 
            const loaderDiv = domElements.loaderDiv || document.getElementById('loader');
            const pythonErrorDiv = domElements.pythonErrorDiv || document.getElementById('python-error');
            
            if (loaderDiv) loaderDiv.textContent = errorMsg;
            if (pythonErrorDiv) pythonErrorDiv.textContent = (pythonErrorDiv.textContent || '') + errorMsg + '\\n';
        }

        async function onPyodideLoad() {
            domElements.pythonOutputDiv = document.getElementById('python-output');
            domElements.pythonErrorDiv = document.getElementById('python-error');
            domElements.loaderDiv = document.getElementById('loader');

            if (!domElements.pythonOutputDiv || !domElements.pythonErrorDiv || !domElements.loaderDiv) {
                onPyodideError("Error: Preview DOM elements missing.");
                return;
            }

            try {
                if (typeof window.loadPyodide !== 'function') {
                    onPyodideError('Pyodide library not loaded. Python preview will not work.'); 
                    return;
                }

                if (domElements.loaderDiv) domElements.loaderDiv.textContent = 'Initializing Pyodide...';
                
                pyodideInstance = await window.loadPyodide({});
                
                if (domElements.loaderDiv) domElements.loaderDiv.textContent = 'Pyodide loaded. Setting up environment...';
                
                pyodideInstance.setStdout({ 
                    batched: (str) => { 
                        if (domElements.pythonOutputDiv) domElements.pythonOutputDiv.textContent += str + '\\n'; 
                        if (domElements.pythonOutputDiv && domElements.pythonOutputDiv.parentElement) domElements.pythonOutputDiv.parentElement.scrollTop = domElements.pythonOutputDiv.parentElement.scrollHeight;
                    } 
                });
                pyodideInstance.setStderr({ 
                    batched: (str) => { 
                        if (domElements.pythonErrorDiv) domElements.pythonErrorDiv.textContent += str + '\\n'; 
                        if (domElements.pythonErrorDiv && domElements.pythonErrorDiv.parentElement) domElements.pythonErrorDiv.parentElement.scrollTop = domElements.pythonErrorDiv.parentElement.scrollHeight;
                    } 
                });
                
                if (domElements.loaderDiv) domElements.loaderDiv.textContent = 'Executing Python script...';
                await pyodideInstance.runPythonAsync(userPythonCode); 
                if (domElements.loaderDiv) domElements.loaderDiv.style.display = 'none'; 

            } catch (err) {
                if (domElements.loaderDiv) domElements.loaderDiv.style.display = 'none'; 
                let errorMsg = 'Error during Pyodide execution: ' + (err instanceof Error ? err.toString() : String(err)) + '\\n';
                if (err instanceof Error && err.stack) {
                    errorMsg += err.stack + '\\n';
                }
                if (domElements.pythonErrorDiv) domElements.pythonErrorDiv.textContent += errorMsg;
                console.error("Pyodide/Python execution error:", err);
            }
        }
    <\/script>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" onload="onPyodideLoad()" onerror="onPyodideError()"><\/script>
    <div id="output-container">
        <div id="loader">Loading Python environment (Pyodide)...</div>
        <h4>Standard Output (stdout):</h4>
        <pre id="python-output" class="output-area"></pre>
        <h4>Standard Error (stderr):</h4>
        <pre id="python-error" class="output-area"></pre>
    </div>
</body></html>`;
            } else if (lowerCaseLanguage === 'typescript') {
                newPreviewHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeScript Live Preview</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; color: ${iframeText}; background-color: ${iframeBg}; }
        #app { padding: 15px; border-bottom: 1px solid ${iframeBorder}; flex-grow: 1; overflow-y: auto; }
        #app:empty::before { content: "DOM output from your script will appear here."; color: #999; font-style: italic; }
        #console-output-container { flex-shrink: 0; max-height: 50%; overflow-y: auto; border-top: 1px solid ${iframeBorder}; background-color: ${iframeConsoleBg}; }
        #console-output-container h4 { margin: 8px 12px 5px; font-size: 0.9em; color: ${iframeText}; opacity: 0.8; font-weight: 600; }
        #console-output { padding: 0 12px 8px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 0.85em; line-height: 1.4; }
        .console-log { color: ${iframeText}; opacity: 0.9; }
        .console-error { color: #D32F2F; font-weight: bold; }
        .console-warn { color: #FF8F00; }
        .console-info { color: #0277BD; }
        pre { margin: 0 0 3px 0; white-space: pre-wrap; word-wrap: break-word; }
        #loader-ts { text-align: center; padding: 20px; font-style: italic; color: ${iframeText}; opacity: 0.7;}
    </style>
    <script>
      // Function to handle Sucrase loading errors
      function handleSucraseLoadError() {
        const loaderTsDiv = document.getElementById('loader-ts');
        const consoleOutputDiv = document.getElementById('console-output');
        const errorMsg = 'Failed to load Sucrase library from CDN. TypeScript preview cannot start.';
        
        console.error(errorMsg); // Log to browser console
        
        if (loaderTsDiv) {
          loaderTsDiv.textContent = errorMsg;
          loaderTsDiv.style.color = '#D32F2F';
          loaderTsDiv.style.fontWeight = 'bold';
        }
        if (consoleOutputDiv) {
            const pre = document.createElement('pre');
            pre.className = 'console-error';
            pre.textContent = errorMsg;
            consoleOutputDiv.appendChild(pre);
        }
      }

      // Function to initialize the TypeScript preview once Sucrase is loaded
      function initTypeScriptPreview() {
        const consoleOutputDiv = document.getElementById('console-output');
        const appDiv = document.getElementById('app');
        const loaderTsDiv = document.getElementById('loader-ts');

        if (!consoleOutputDiv || !appDiv || !loaderTsDiv) {
            console.error("Preview setup failed: essential DOM elements (console-output, app or loader-ts) not found.");
            if(loaderTsDiv) { // Check again in case it was the one missing
              loaderTsDiv.textContent = "Preview setup failed: DOM elements missing.";
              loaderTsDiv.style.color = '#D32F2F';
              loaderTsDiv.style.fontWeight = 'bold';
            } else if (consoleOutputDiv) { // If loader is missing, log to console output
                const pre = document.createElement('pre');
                pre.className = 'console-error';
                pre.textContent = "Preview setup failed: DOM elements missing (loader-ts).";
                consoleOutputDiv.appendChild(pre);
            }
            return;
        }

        // Console override logic
        const originalConsole = { log: console.log.bind(console), error: console.error.bind(console), warn: console.warn.bind(console), info: console.info.bind(console) };
        function formatArg(arg) {
            if (arg instanceof Error) { return arg.stack || arg.toString(); }
            if (typeof arg === 'object' && arg !== null) { try { return JSON.stringify(arg, null, 2); } catch (e) { return String(arg); } }
            return String(arg);
        }
        function logToDiv(type, args) {
            const message = Array.from(args).map(formatArg).join(' ');
            const pre = document.createElement('pre');
            pre.className = 'console-' + type;
            pre.textContent = message;
            consoleOutputDiv.appendChild(pre);
            if(consoleOutputDiv.parentElement) { consoleOutputDiv.parentElement.scrollTop = consoleOutputDiv.parentElement.scrollHeight; }
        }
        console.log = function(...args) { originalConsole.log(...args); logToDiv('log', args); };
        console.error = function(...args) { originalConsole.error(...args); logToDiv('error', args); };
        console.warn = function(...args) { originalConsole.warn(...args); logToDiv('warn', args); };
        console.info = function(...args) { originalConsole.info(...args); logToDiv('info', args); };
        window.addEventListener('error', function(event) {
            const errorArgs = ['Uncaught Error:'];
            if (event.message) errorArgs.push(event.message);
            if (event.filename) errorArgs.push('at ' + event.filename.substring(event.filename.lastIndexOf('/') + 1) + ':' + event.lineno + ':' + event.colno);
            logToDiv('error', errorArgs);
            originalConsole.error('Uncaught Error:', event.message, event.filename, event.lineno, event.colno, event.error);
            event.preventDefault();
        });
        window.addEventListener('unhandledrejection', function(event) { logToDiv('error', ['Unhandled Promise Rejection:', event.reason]); originalConsole.error('Unhandled Promise Rejection:', event.reason); event.preventDefault(); });

        // Sucrase check and usage
        if (typeof window.sucrase === 'undefined' || typeof window.sucrase.transform !== 'function') {
            const errorMsg = 'Sucrase library not available (sucrase or sucrase.transform is undefined) even after load event. TypeScript preview will not work.';
            console.error(errorMsg); // Log to main console
            logToDiv('error', [errorMsg]); // Log to iframe console
            if(loaderTsDiv) {
              loaderTsDiv.textContent = errorMsg;
              loaderTsDiv.style.color = '#D32F2F';
              loaderTsDiv.style.fontWeight = 'bold';
            }
            return;
        }
        
        if(loaderTsDiv) loaderTsDiv.textContent = 'Transpiling TypeScript...';
        try {
            let rawTsCode = decodeURIComponent("${encodeURIComponent(cleanedCode)}");
            // rawTsCode = rawTsCode.replace(/<\\/script>/gi, '<\\\\/script>'); // Already commented out

            const jsCode = window.sucrase.transform(rawTsCode, {
                transforms: ["typescript", "imports"], 
                filePath: "livepreview.ts"
            }).code;

            if(loaderTsDiv) loaderTsDiv.style.display = 'none';
            
            const scriptTag = document.createElement('script');
            scriptTag.type = 'text/javascript';
            // Using textContent is safer than innerHTML for script tags
            scriptTag.textContent = jsCode; 
            document.body.appendChild(scriptTag);

        } catch (e) {
            if(loaderTsDiv) loaderTsDiv.style.display = 'none';
            console.error('Error transpiling or executing TypeScript:', e); // Caught by overridden console.error
        }
      }
    <\/script>
    // Removed: <script src="https://unpkg.com/sucrase@3.34.0/dist/plugin-typescript.js"><\/script>
    <script src="https://unpkg.com/sucrase@3.34.0/dist/index.js" onload="initTypeScriptPreview()" onerror="handleSucraseLoadError()"><\/script>
</head>
<body>
    <div id="loader-ts">Loading TypeScript transpiler (Sucrase)...</div>
    <div id="app"></div>
    <div id="console-output-container">
      <h4>Console Output:</h4>
      <div id="console-output"></div>
    </div>
    <!-- The old IIFE script that might have been here is confirmed removed by prior logic. -->
</body></html>`;
            }
        } else {
             // If not meaningful or no code, ensure previewHtml is null
            newPreviewHtmlContent = null;
        }
      }
      setPreviewHtml(newPreviewHtmlContent);

    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setGeneratedCode('');
      setPortfolioOutput(null);
      setPreviewHtml(null);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, language, selectedProjectType, stripMarkdownCodeBlock, theme.colors]);

  const handleExplainCode = useCallback(async () => {
    const codeToExplain = selectedProjectType.value === 'portfolio' && portfolioOutput 
        ? `HTML:\n${portfolioOutput.html}\n\nCSS:\n${portfolioOutput.css}\n\nJavaScript:\n${portfolioOutput.javascript}`
        : generatedCode;
    
    const langToExplain = selectedProjectType.value === 'portfolio' ? 'html_css_javascript' : language;

    if (!codeToExplain.trim()) {
      setError("No code available to explain.");
      return;
    }
    
    setError(null); 
    setIsExplainingCode(true);
    setExplanationText(null); 

    try {
      const explanation = await GeminiService.explainCode(codeToExplain, langToExplain);
      setExplanationText(explanation);
    } catch (err) {
      console.error('Error explaining code:', err);
      setExplanationText(null); 
      setError(err instanceof Error ? `Explanation failed: ${err.message}` : 'An unknown error occurred while explaining code.');
    } finally {
      setIsExplainingCode(false);
    }
  }, [generatedCode, portfolioOutput, language, selectedProjectType.value]);

  const handleViewExplanation = useCallback(() => {
    if (explanationText) {
      setShowExplanationModal(true);
    } else {
      handleExplainCode().then(() => {
        setShowExplanationModal(true); 
      });
    }
  }, [explanationText, handleExplainCode]);


  useEffect(() => {
    // This effect ensures that if the project type changes (and it requires a language),
    // and the current language is invalid or not set for that type, it defaults appropriately.
    // It also resets the userOverriddenLanguage flag in such cases.
    const currentSelectedPT = PROJECT_TYPES.find(pt => pt.value === projectTypeVal);
    if (currentSelectedPT?.requiresLanguage) {
        const isCurrentLangInSupportedList = SUPPORTED_LANGUAGES.some(l => l.value === language);
        // If language is not set, or not in the supported list for the current project type
        // (e.g. project type changed and current language is no longer valid)
        if (!language || !isCurrentLangInSupportedList) {
            setLanguage(currentSelectedPT.defaultLanguage || DEFAULT_LANGUAGE);
            setUserOverriddenLanguage(false); 
        }
    }
  }, [projectTypeVal, language]); // Rerun if projectTypeVal or language changes.
  

  const containerMaxWidth = showLivePreview && previewHtml ? "max-w-[90rem]" : "max-w-6xl";
  
  const displayedCode = selectedProjectType.value === 'portfolio' && portfolioOutput 
    ? portfolioOutput[activePortfolioTab] 
    : generatedCode;
  
  const displayedLanguage = selectedProjectType.value === 'portfolio' && portfolioOutput
    ? activePortfolioTab
    : (selectedProjectType.value === 'db_schema' ? 'sql' : language);

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center p-4 md:p-6 lg:p-8 transition-colors duration-300 ease-in-out`}>
      <header className={`w-full ${containerMaxWidth} mb-6 md:mb-8 text-center transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-center w-full mb-2">
          <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-accent)]" />
          <h1 className="ml-3 text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
            NextGen Code Generator
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-md md:text-lg">Instantly generate code, explanations, and previews.</p>
      </header>

      <main className={`w-full ${containerMaxWidth} transition-all duration-300 ease-in-out ${showLivePreview && previewHtml ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)] gap-6 md:gap-8' : 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'}`}>
        {showLivePreview && previewHtml ? (
          <>
            {/* Column 1: Input Details & Generated Code (when preview is shown) */}
            <div className="flex flex-col gap-6 md:gap-8 lg:h-[calc(100vh-180px)] lg:overflow-y-auto pr-2 simple-scrollbar">
              {/* Input Details Panel */}
              <div className="bg-[var(--bg-secondary)] p-6 rounded-xl shadow-2xl border border-[var(--border-primary)]">
                <h2 className="text-2xl font-semibold mb-6 text-[var(--text-accent)]">Input Details</h2>
                <div className="space-y-6">
                  <PromptInput 
                    value={prompt} 
                    onTextChange={handlePromptTextChange} 
                    onExamplePromptUpdate={handleExamplePromptUpdate} 
                  />
                  <ProjectTypeSelector 
                    value={projectTypeVal} 
                    onChange={handleProjectTypeChange} 
                    projectTypes={PROJECT_TYPES} 
                  />
                  {selectedProjectType.requiresLanguage && (
                    <LanguageSelector 
                      value={language} 
                      onChange={handleLanguageChange} 
                      languages={SUPPORTED_LANGUAGES} 
                    />
                  )}
                  <button onClick={handleGenerateCode} disabled={isLoading || isExplainingCode} className="w-full flex items-center justify-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-secondary)] text-[var(--text-on-accent)] font-semibold py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-opacity-75 shadow-md hover:shadow-lg disabled:shadow-none" aria-live="polite">
                    {isLoading ? (<><LoadingSpinner className="w-5 h-5 mr-2" />Generating Code...</>) : (<><SparklesIcon className="w-5 h-5 mr-2" />Generate Code</>)}
                  </button>
                  <button onClick={() => setShowLivePreview(false)} className="w-full flex items-center justify-center bg-[var(--accent-secondary)] hover:bg-[var(--accent-secondary-hover)] text-[var(--text-on-accent)] font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 shadow-md hover:shadow-lg" aria-label="Hide Live Preview">
                    <CompressIcon className="w-5 h-5 mr-2" /> Hide Preview
                  </button>
                </div>
              </div>

              {/* Generated Code Panel */}
              <div className="bg-[var(--bg-secondary)] p-6 rounded-xl shadow-2xl border border-[var(--border-primary)] flex flex-col flex-grow min-h-[250px]">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-2xl font-semibold text-[var(--text-accent)]">Generated Code</h2>
                </div>
                 {selectedProjectType.value === 'portfolio' && portfolioOutput && (
                    <div className="mb-3 border-b border-[var(--border-primary)]">
                        {(Object.keys(PORTFOLIO_LANGUAGES) as PortfolioLanguageKey[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActivePortfolioTab(key)}
                                className={`py-2 px-4 text-sm font-medium ${activePortfolioTab === key ? 'text-[var(--text-accent)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                {PORTFOLIO_LANGUAGES[key]}
                            </button>
                        ))}
                    </div>
                )}
                <p className="text-xs text-[var(--text-secondary)] mb-4">Model: {GEMINI_MODEL_NAME} | Type: {selectedProjectType.label} {selectedProjectType.requiresLanguage ? `(${language})` : (selectedProjectType.value === 'db_schema' ? '(SQL)' : '')}</p>
                {error && <div className="bg-[var(--accent-error)] border border-red-500 text-white px-4 py-3 rounded-md mb-4" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>}
                
                <CodeDisplay
                  code={displayedCode}
                  language={displayedLanguage}
                  isLoading={isLoading && !generatedCode && !portfolioOutput} 
                  onExplainCode={handleExplainCode}
                  onViewExplanation={handleViewExplanation}
                  isExplaining={isExplainingCode}
                  explanationAvailable={!!explanationText}
                />
              </div> 
            </div> 

            {/* Column 2: Live Preview Panel */}
            <div className="bg-[var(--bg-secondary)] rounded-xl shadow-2xl border border-[var(--border-primary)] flex flex-col overflow-hidden relative lg:h-[calc(100vh-180px)]">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  title="Live Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] p-4">
                  <EyeIcon className="w-16 h-16 opacity-50 mb-4" />
                  <p>Live preview will appear here.</p>
                  <p className="text-sm mt-1"> (Only available for certain project types like HTML, JS, Python, Portfolio)</p>
                  {(isLoading || isExplainingCode) && <p className="mt-2">Processing...</p>}
                  {error && <p className="mt-2 text-[var(--accent-error)]">Error loading preview.</p>}
                </div>
              )}
            </div> 
          </>
        ) : (
          // Collapsed View (when preview is not shown or not available)
          <>
            {/* Panel 1: Input Details */}
            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl shadow-2xl border border-[var(--border-primary)]">
              <h2 className="text-2xl font-semibold mb-6 text-[var(--text-accent)]">Input Details</h2>
              <div className="space-y-6">
                <PromptInput 
                  value={prompt} 
                  onTextChange={handlePromptTextChange} 
                  onExamplePromptUpdate={handleExamplePromptUpdate} 
                />
                <ProjectTypeSelector 
                  value={projectTypeVal} 
                  onChange={handleProjectTypeChange} 
                  projectTypes={PROJECT_TYPES} 
                />
                {selectedProjectType.requiresLanguage && (
                  <LanguageSelector 
                    value={language} 
                    onChange={handleLanguageChange} 
                    languages={SUPPORTED_LANGUAGES} 
                  />
                )}
                <button onClick={handleGenerateCode} disabled={isLoading || isExplainingCode} className="w-full flex items-center justify-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-secondary)] text-[var(--text-on-accent)] font-semibold py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-opacity-75 shadow-md hover:shadow-lg disabled:shadow-none" aria-live="polite">
                  {isLoading ? (<><LoadingSpinner className="w-5 h-5 mr-2" />Generating Code...</>) : (<><SparklesIcon className="w-5 h-5 mr-2" />Generate Code</>)}
                </button>
                {previewHtml && !showLivePreview && ( 
                    <button onClick={() => setShowLivePreview(true)} className="w-full flex items-center justify-center bg-[var(--accent-secondary)] hover:bg-[var(--accent-secondary-hover)] text-[var(--text-on-accent)] font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 shadow-md hover:shadow-lg" aria-label="Show Live Preview">
                       <ExpandIcon className="w-5 h-5 mr-2" /> Show Live Preview
                    </button>
                )}
              </div>
            </div>

            {/* Panel 2: Generated Code */}
            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl shadow-2xl border border-[var(--border-primary)] flex flex-col min-h-[400px] md:min-h-[calc(100vh-180px-4rem)] lg:min-h-0 md:max-h-[calc(100vh-180px)] md:overflow-y-auto simple-scrollbar">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl font-semibold text-[var(--text-accent)]">Generated Code</h2>
              </div>
              {selectedProjectType.value === 'portfolio' && portfolioOutput && (
                <div className="mb-3 border-b border-[var(--border-primary)]">
                  {(Object.keys(PORTFOLIO_LANGUAGES) as PortfolioLanguageKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActivePortfolioTab(key)}
                      className={`py-2 px-4 text-sm font-medium ${activePortfolioTab === key ? 'text-[var(--text-accent)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                      {PORTFOLIO_LANGUAGES[key]}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--text-secondary)] mb-4">Model: {GEMINI_MODEL_NAME} | Type: {selectedProjectType.label} {selectedProjectType.requiresLanguage ? `(${language})` : (selectedProjectType.value === 'db_schema' ? '(SQL)' : '')}</p>
              {error && <div className="bg-[var(--accent-error)] border border-red-500 text-white px-4 py-3 rounded-md mb-4" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>}
              <CodeDisplay
                code={displayedCode}
                language={displayedLanguage}
                isLoading={isLoading && !generatedCode && !portfolioOutput}
                onExplainCode={handleExplainCode}
                onViewExplanation={handleViewExplanation}
                isExplaining={isExplainingCode}
                explanationAvailable={!!explanationText}
              />
            </div> 
          </>
        )}
      </main>

      {showExplanationModal && (
        <ExplanationModal
          isOpen={showExplanationModal}
          onClose={() => setShowExplanationModal(false)}
          explanation={explanationText}
          isLoading={isExplainingCode}
          language={selectedProjectType.value === 'portfolio' ? 'Portfolio Code' : (selectedProjectType.value === 'db_schema' ? 'SQL' : language)}
        />
      )}

      <footer className={`w-full ${containerMaxWidth} mt-8 md:mt-12 text-center text-[var(--text-secondary)] text-sm transition-all duration-300 ease-in-out`}>
        <p>&copy; 2025 Aaditya Sapkota - All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default App;
