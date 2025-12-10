import { useState, useEffect } from 'react';

const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const text = selection.toString().trim();
        const wordCount = text.split(/\s+/).length;

        // Validate word count: 10-2000 words
        if (wordCount >= 10 && wordCount <= 2000) {
          setSelectedText(text);
        } else if (wordCount < 10) {
          // If less than 10 words, still set it but maybe show a warning
          setSelectedText(text);
        } else {
          // If more than 2000 words, clear the selection
          setSelectedText('');
        }
      } else {
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  return { selectedText, clearSelection: () => setSelectedText('') };
};

export default useTextSelection;