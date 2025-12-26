import { ErrorMessageProps } from '@/types/chat';

/**
 * Displays error messages with optional dismiss functionality.
 *
 * @param message - The error message to display (null to hide)
 * @param onDismiss - Optional callback to handle dismiss action
 * @returns Error message component or null if no message
 */
export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <p className="text-red-800 text-sm">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-600 hover:text-red-800 font-medium text-sm"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
