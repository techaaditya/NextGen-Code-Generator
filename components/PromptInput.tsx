

import React, { useState, useEffect, KeyboardEvent, useCallback } from 'react';
import { EXAMPLE_PROMPTS } from '../constants';
import { ExamplePromptItem } from '../types';

interface PromptInputProps {
  value: string;
  onTextChange: (value: string, sourceExample?: ExamplePromptItem) => void; // Called when textarea value changes (typing or tab)
  onExamplePromptUpdate: (example: ExamplePromptItem) => void; // Called when placeholder example changes
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onTextChange, onExamplePromptUpdate }) => {
  const [currentExample, setCurrentExample] = useState<ExamplePromptItem | null>(null);

  const selectNewExample = useCallback(() => {
    if (EXAMPLE_PROMPTS.length > 0) {
      const randomIndex = Math.floor(Math.random() * EXAMPLE_PROMPTS.length);
      setCurrentExample(EXAMPLE_PROMPTS[randomIndex]);
    } else {
      setCurrentExample(null); // Fallback if EXAMPLE_PROMPTS is empty
    }
  }, []); // EXAMPLE_PROMPTS is a constant import

  useEffect(() => {
    selectNewExample(); // Select an initial example on mount
  }, [selectNewExample]);

  useEffect(() => {
    // Only call onExamplePromptUpdate if currentExample is set AND the prompt input field (value) is empty.
    // This allows the placeholder to drive default project type/language when the user hasn't typed anything.
    if (currentExample && !value) { 
      onExamplePromptUpdate(currentExample);
    }
  }, [currentExample, onExamplePromptUpdate, value]); // Added `value` to dependencies

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (currentExample) {
        onTextChange(currentExample.text, currentExample); // Fill textarea and pass the source example
        // Do NOT select a new example here. The placeholder should remain
        // the same as the example that was just accepted.
      }
    }
  };

  return (
    <div>
      <label htmlFor="prompt" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
        Coding Task / Prompt
      </label>
      <textarea
        id="prompt"
        name="prompt"
        rows={6}
        className="block w-full bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded-md shadow-sm focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] text-xs xs:text-sm p-2 xs:p-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] placeholder-opacity-70 resize-none outline-none transition-colors duration-150"
        placeholder={currentExample?.text || "Describe your coding task or press Tab for an example..."}
        value={value}
        onChange={(e) => onTextChange(e.target.value)} // No sourceExample for typing
        onKeyDown={handleKeyDown}
        aria-describedby="prompt-description"
      />
      <p id="prompt-description" className="text-xs text-[var(--text-secondary)] mt-1.5">
        Type your task or press Tab to use the example placeholder. Language & project type will adjust to examples.
      </p>
    </div>
  );
};
