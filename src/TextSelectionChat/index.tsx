import React, { useState, useEffect, useRef } from 'react';
import { ChatService } from '@/services/chatService';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TextSelectionChat() {
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      // Don't change selection if we are viewing a result modal
      if (response) return;

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        if (!isOpen) {
          setSelection(null);
        }
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const text = sel.toString();

      setSelection({
        text,
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10 + window.scrollY
      });
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [isOpen, response]);

  // Click outside to close (only for the mini tooltip)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (response) return; // Don't auto-close modal on outside click (let user use X)
      
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelection(null);
        setInput('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [response]);

  const handleAsk = async () => {
    if (!input.trim() || !selection) return;
    
    setLoading(true);
    try {
      const reply = await ChatService.sendSelectedChat(selection.text, input);
      setResponse(reply);
      // Close the mini tooltip state as we move to modal
      setIsOpen(false);
    } catch (e) {
      setResponse("Sorry, I couldn't process that.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResponse(null);
    setInput('');
    setIsOpen(false);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  if (!selection && !response) return null;

  // --- MODE 1: Result Modal (Large, Centered) ---
  if (response) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-slide-up">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <div className="flex items-center space-x-2">
                    <span className="text-xl sm:text-2xl">✨</span>
                    <h3 className="font-bold text-base sm:text-lg m-0">AI Explanation</h3>
                </div>
                <button 
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                    ✕
                </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-4 sm:p-8 overflow-y-auto markdown-content">
                 <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 border-l-4 border-primary pl-3 sm:pl-4 py-1 italic bg-gray-50 dark:bg-white/5 rounded-r-lg break-words">
                    "{selection?.text}"
                 </div>
                 <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
                 </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 flex justify-end">
                <button 
                    onClick={handleClose}
                    className="button button--primary text-sm sm:text-base"
                >
                    Done
                </button>
            </div>
        </div>
    </div>
    );
  }

  // --- MODE 2: Trigger Button (Small, near text) ---
  if (!isOpen) {
    return (
      <button
        className="fixed z-[60] bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-bold animate-fade-in hover:scale-105 transition-transform flex items-center space-x-1 sm:space-x-2"
        style={{ 
          left: Math.min(selection!.x, window.innerWidth - 80), 
          top: selection!.y - window.scrollY,
          transform: 'translateX(-50%)' 
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <span>Ask AI</span>
        <span>🤖</span>
      </button>
    );
  }

  // --- MODE 3: Input Bubble (Medium, near text) ---
  return (
    <div
      ref={wrapperRef}
      className="fixed z-[60] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-3 sm:p-4 w-[calc(100vw-2rem)] max-w-[320px] sm:max-w-[360px] animate-fade-in"
      style={{ 
        left: Math.min(Math.max(selection!.x, 160), window.innerWidth - 160), 
        top: selection!.y - window.scrollY,
        transform: 'translateX(-50%)' 
      }}
    >
      <div className="text-[10px] sm:text-xs text-gray-400 mb-2 truncate font-medium">
        Selected: "{selection!.text}"
      </div>
      
      <div className="flex flex-col gap-3">
        <textarea
          className="w-full p-3 text-sm border rounded-lg bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none resize-none transition-all"
          rows={3}
          placeholder="What do you want to know?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end space-x-2">
            <button
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2"
                onClick={() => setIsOpen(false)}
            >
                Cancel
            </button>
            <button
                className="bg-primary text-white text-sm py-1.5 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-bold shadow-md"
                onClick={handleAsk}
                disabled={loading}
            >
                {loading ? 'Thinking...' : 'Ask'}
            </button>
        </div>
      </div>
    </div>
  );
}