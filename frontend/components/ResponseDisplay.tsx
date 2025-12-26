import { ResponseDisplayProps } from '@/types/chat';

/**
 * Displays chat query and response with loading and empty states.
 * Shows query with timestamp and response with optional citations.
 *
 * @param query - The submitted chat query (null if none)
 * @param response - The chat response (null if none)
 * @param isLoading - Whether response is loading
 * @returns Response display component with query/response sections
 */
export default function ResponseDisplay({
  query,
  response,
  isLoading,
}: ResponseDisplayProps) {
  if (isLoading) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Ask a question to get started</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Your Question</p>
        <p className="text-gray-900">{query.text}</p>
        <p className="text-xs text-gray-500 mt-2">
          {new Date(query.timestamp).toLocaleString()}
        </p>
      </div>

      {response && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Response</p>
          <p className="text-gray-900">{response.text}</p>
          {response.citations && response.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Citations:</p>
              <ul className="space-y-2">
                {response.citations.map((citation, index) => (
                  <li key={index} className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                    {citation.chapter && (
                      <div className="font-medium">{citation.chapter}</div>
                    )}
                    {citation.section && (
                      <div className="text-gray-600">{citation.section}</div>
                    )}
                    {citation.referenced_text && (
                      <div className="mt-1 text-gray-500 italic">
                        &quot;{citation.referenced_text}&quot;
                      </div>
                    )}
                    {citation.source_url && (
                      <a
                        href={citation.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                      >
                        View Source
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
