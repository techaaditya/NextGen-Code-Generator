
import React, { useEffect, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify'; // Import DOMPurify
import { LoadingSpinner } from './LoadingSpinner';
import { LightBulbIcon }  from './Icons';
import { ExplanationModalProps } from '../types';

// Configure marked 
// Removed sanitize: true as it's deprecated/removed. Sanitization will be handled by DOMPurify.
marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  gfm: true,
  breaks: false,
  // sanitize: true, // IMPORTANT for security - REMOVED
  smartypants: false,
  xhtml: false
});

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, explanation, isLoading, language }) => {
  if (!isOpen) return null;

  const renderedExplanationHtml = useMemo(() => {
    if (isLoading || !explanation) return '';
    try {
      const rawHtml = marked.parse(explanation) as string;
      // Sanitize the HTML output using DOMPurify
      return DOMPurify.sanitize(rawHtml);
    } catch (error) {
      console.error("Error parsing or sanitizing Markdown explanation:", error);
      return "<p>Error rendering explanation. The content might be malformed or unsafe.</p>";
    }
  }, [isLoading, explanation]);

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-primary)] bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="explanation-modal-title"
    >
      <div 
        className="bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-[var(--border-primary)]"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <header className="flex items-center justify-between p-4 md:p-5 border-b border-[var(--border-secondary)] sticky top-0 bg-[var(--bg-secondary)] z-10">
          <div className="flex items-center">
            <LightBulbIcon className="w-6 h-6 text-[var(--text-accent)] mr-3" />
            <h2 id="explanation-modal-title" className="text-xl md:text-2xl font-semibold text-[var(--text-accent)]">
              Code Explanation <span className="text-base text-[var(--text-secondary)] font-normal">({language})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-full hover:bg-[var(--bg-tertiary)]"
            aria-label="Close explanation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-4 md:p-6 flex-grow overflow-y-auto simple-scrollbar">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
              <LoadingSpinner className="w-12 h-12 text-[var(--text-accent)]" />
              <p className="mt-4 text-[var(--text-secondary)]">Generating explanation...</p>
            </div>
          )}
          {!isLoading && explanation && (
            <article 
              className="prose prose-sm sm:prose-base lg:prose-lg max-w-none"
              style={{
                // @ts-ignore
                '--tw-prose-body': 'var(--text-primary)',
                '--tw-prose-headings': 'var(--text-accent)',
                '--tw-prose-lead': 'var(--text-secondary)',
                '--tw-prose-links': 'var(--accent-primary)',
                '--tw-prose-bold': 'var(--text-primary)',
                '--tw-prose-counters': 'var(--text-secondary)',
                '--tw-prose-bullets': 'var(--text-secondary)',
                '--tw-prose-hr': 'var(--border-secondary)',
                '--tw-prose-quotes': 'var(--text-secondary)',
                '--tw-prose-quote-borders': 'var(--accent-primary)',
                '--tw-prose-captions': 'var(--text-secondary)',
                '--tw-prose-code': 'var(--text-accent)', // Inline code
                '--tw-prose-pre-code': 'var(--text-primary)', // Code within pre
                '--tw-prose-pre-bg': 'var(--code-bg)', // Background for pre
                '--tw-prose-th-borders': 'var(--border-secondary)',
                '--tw-prose-td-borders': 'var(--border-primary)',
                // Adjust heading sizes for modal context if needed
                // 'h2': { fontSize: '1.25em', marginBottom: '0.5em' },
                // 'h3': { fontSize: '1.1em', marginBottom: '0.4em' },
              }}
              dangerouslySetInnerHTML={{ __html: renderedExplanationHtml }}
            />
          )}
          {!isLoading && !explanation && (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
               <LightBulbIcon className="w-12 h-12 text-[var(--text-secondary)] opacity-50" />
              <p className="mt-4 text-[var(--text-secondary)] text-center">No explanation available or an error occurred.</p>
            </div>
          )}
        </div>
        
        <footer className="p-4 md:p-5 border-t border-[var(--border-secondary)] text-right sticky bottom-0 bg-[var(--bg-secondary)] z-10">
          <button
            onClick={onClose}
            className="bg-[var(--accent-secondary)] hover:bg-[var(--accent-secondary-hover)] text-[var(--text-on-accent)] font-semibold py-2.5 px-5 rounded-lg transition-colors duration-150 shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};
