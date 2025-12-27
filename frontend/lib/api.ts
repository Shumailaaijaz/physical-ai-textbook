import type {
  BackendQueryRequest,
  BackendQueryResponse,
  APIError,
} from '@/types/chat';

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://shumailaaijaz-hackathon-book.hf.space';

const API_TIMEOUT = 30000; // 30 seconds

/**
 * Submit a query to the backend RAG system
 * @param query User's question (1-1000 characters)
 * @returns Backend response with answer and citations
 * @throws APIError with type: 'network' | 'timeout' | 'http' | 'validation'
 */
export async function submitQuery(query: string): Promise<BackendQueryResponse> {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    // Make POST request to backend
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query } as BackendQueryRequest),
      signal: controller.signal,
    });

    // Handle HTTP errors (4xx/5xx)
    if (!response.ok) {
      const error: APIError = {
        type: 'http',
        message: 'Server error. Please try again later.',
        statusCode: response.status,
        details: `HTTP ${response.status}: ${response.statusText}`,
      };
      throw error;
    }

    // Parse JSON response
    const data = await response.json();

    // Validate response format
    const validatedResponse = validateBackendResponse(data);

    return validatedResponse;
  } catch (error) {
    // Handle timeout error (AbortError)
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError: APIError = {
        type: 'timeout',
        message: 'Request timed out. Please try again.',
        details: `Request aborted after ${API_TIMEOUT}ms`,
      };
      throw timeoutError;
    }

    // Handle network errors (TypeError from fetch)
    if (error instanceof TypeError) {
      const networkError: APIError = {
        type: 'network',
        message: 'Unable to connect to server. Please try again.',
        details: error.message,
      };
      throw networkError;
    }

    // If it's already an APIError, re-throw it
    if (isAPIError(error)) {
      throw error;
    }

    // Unknown error - treat as network error
    const unknownError: APIError = {
      type: 'network',
      message: 'An unexpected error occurred. Please try again.',
      details: error instanceof Error ? error.message : String(error),
    };
    throw unknownError;
  } finally {
    // Clear timeout
    clearTimeout(timeoutId);
  }
}

/**
 * Validate backend response format
 * @param data Raw response data from backend
 * @returns Validated BackendQueryResponse
 * @throws APIError with type 'validation' if response is invalid
 */
function validateBackendResponse(data: unknown): BackendQueryResponse {
  // Type guard: check if data is an object
  if (typeof data !== 'object' || data === null) {
    const error: APIError = {
      type: 'validation',
      message: 'Invalid response from server.',
      details: 'Response is not an object',
    };
    throw error;
  }

  const response = data as Record<string, unknown>;

  // Required: answer field (non-empty string)
  if (typeof response.answer !== 'string' || response.answer.trim().length === 0) {
    const error: APIError = {
      type: 'validation',
      message: 'Invalid response from server.',
      details: 'Missing or empty "answer" field',
    };
    throw error;
  }

  // Backend returns 'sources' field, map it to 'citations'
  const citations = Array.isArray(response.sources)
    ? response.sources
    : (Array.isArray(response.citations) ? response.citations : []);

  // Optional: timestamp (default to current time if missing)
  const timestamp =
    typeof response.timestamp === 'number'
      ? response.timestamp
      : Math.floor(Date.now() / 1000);

  return {
    answer: response.answer,
    citations,
    timestamp,
  };
}

/**
 * Type guard to check if error is an APIError
 */
function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    (error as APIError).type in ['network', 'timeout', 'http', 'validation']
  );
}
