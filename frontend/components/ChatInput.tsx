import { ChatInputProps } from '@/types/chat';

/**
 * Text input field with submit button for chat queries.
 * Supports Enter key submission and disabled states.
 *
 * @param value - Current input value
 * @param onChange - Callback when input value changes
 * @param onSubmit - Callback when form is submitted
 * @param isSubmitting - Whether submission is in progress
 * @param disabled - Whether input should be disabled
 * @returns Chat input component with text field and submit button
 */
export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled = false,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSubmitting}
        placeholder="Ask a question about Physical AI..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-label="Query input"
      />
      <button
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        aria-label="Submit query"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
}
