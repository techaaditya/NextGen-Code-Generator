

import React, { useState, useEffect } from 'react';
import { CopyButton } from './CopyButton';
import { LoadingSpinner } from './LoadingSpinner';
import { LightBulbIcon } from './Icons'; 

interface CodeDisplayProps {
  code: string;
  language: string;
  isLoading: boolean; // For main code generation
  onExplainCode: () => void; 
  onViewExplanation: () => void;
  isExplaining?: boolean; // For explanation loading state
  explanationAvailable?: boolean;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ 
  code, 
  language, 
  isLoading, 
  onExplainCode,
  onViewExplanation, 
  isExplaining, 
  explanationAvailable 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  useEffect(() => {
    setCopied(false);
  }, [code]);


  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-[var(--bg-tertiary)] bg-opacity-50 rounded-md p-3 xs:p-4 min-h-[150px] xs:min-h-[200px]">
        <LoadingSpinner className="w-8 h-8 xs:w-12 xs:h-12 text-[var(--text-accent)]" />
        <p className="mt-3 xs:mt-4 text-[var(--text-secondary)] text-sm xs:text-base">Generating your masterpiece...</p>
      </div>
    );
  }
  
  if (!code && !isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-[var(--bg-tertiary)] bg-opacity-50 rounded-md p-3 xs:p-4 min-h-[150px] xs:min-h-[200px]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 xs:w-16 xs:h-16 text-[var(--text-secondary)] opacity-60">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
        <p className="mt-3 xs:mt-4 text-[var(--text-secondary)] text-sm xs:text-base">Your generated code will appear here.</p>
      </div>
    );
  }

  const explainButtonBaseClasses = "flex items-center space-x-1.5 py-1.5 px-3 text-xs rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50 font-semibold shadow-sm";
  
  const explainButtonNormalClasses = "bg-[var(--bg-interactive)] text-[var(--text-accent)] border border-[var(--text-accent)] hover:bg-[var(--text-accent)] hover:text-[var(--text-on-accent)] hover:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)] hover:shadow";
  
  const explainButtonLoadingClasses = "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-secondary)] cursor-not-allowed";


  let buttonContent;
  let buttonAction = () => {};
  let buttonClasses = `${explainButtonBaseClasses} ${explainButtonNormalClasses}`;
  let buttonDisabled = false;
  let buttonTitle = "Explain Code";

  if (isExplaining) {
    buttonContent = (
      <>
        <LoadingSpinner className="w-4 h-4" />
        <span>Explaining...</span>
      </>
    );
    buttonClasses = `${explainButtonBaseClasses} ${explainButtonLoadingClasses}`;
    buttonDisabled = true;
    buttonTitle = "Generating explanation";
  } else if (explanationAvailable) {
    buttonContent = (
      <>
        <LightBulbIcon className="w-4 h-4" />
        <span>View Explanation</span>
      </>
    );
    buttonAction = onViewExplanation;
    buttonTitle = "View generated explanation";
  } else {
    buttonContent = (
      <>
        <LightBulbIcon className="w-4 h-4" />
        <span>Explain Code</span>
      </>
    );
    buttonAction = onExplainCode;
    buttonTitle = "Explain this code";
  }

  return (
    <div className="flex-grow flex flex-col bg-[var(--code-bg)] rounded-md overflow-hidden border border-[var(--border-primary)] relative">
      <div className="flex items-center justify-between px-2 xs:px-4 py-1.5 xs:py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
        <span className="text-xs font-semibold text-[var(--text-accent)] uppercase tracking-wider">{language}</span>
        <div className="flex items-center space-x-1 xs:space-x-2">
          {code && ( // Only show explain/view button if there's code
            <button
              onClick={buttonAction}
              disabled={buttonDisabled}
              className={`${buttonClasses} text-xs mobile-tap-target`}
              aria-label={buttonTitle}
              title={buttonTitle}
            >
              {buttonContent}
            </button>
          )}
          <CopyButton onClick={handleCopy} copied={copied} />
        </div>
      </div>
      <pre className="flex-grow p-2 xs:p-4 text-xs xs:text-sm text-[var(--text-primary)] overflow-auto prevent-overflow"> {/* Custom scrollbar applied globally */}
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};