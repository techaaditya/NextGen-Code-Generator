
import React from 'react';

interface CopyButtonProps {
  onClick: () => void;
  copied: boolean;
  className?: string;
  disabled?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ onClick, copied, className, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50 mobile-tap-target ${
        copied 
          ? 'bg-[var(--accent-success)] hover:opacity-80' 
          : 'bg-[var(--bg-interactive)] hover:bg-opacity-70'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[var(--text-on-accent)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${disabled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625-2.625 2.625m2.625-2.625V11.81a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v3.869" />
        </svg>
      )}
    </button>
  );
};