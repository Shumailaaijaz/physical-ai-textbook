export interface ChatQuery {
  text: string;
  timestamp: number;
}

export interface ChatResponse {
  text: string;
  citations?: Citation[];
  timestamp: number;
}

export interface Citation {
  chapter: string | null;
  section: string | null;
  source_url: string | null;
  referenced_text: string | null;
}

export interface ChatState {
  query: string;
  isSubmitting: boolean;
  error: string | null;
  submittedQuery: ChatQuery | null;
  response: ChatResponse | null;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface ChatInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export interface ResponseDisplayProps {
  query: ChatQuery | null;
  response: ChatResponse | null;
  isLoading: boolean;
}

export interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
}

// Backend API Types

export interface BackendQueryRequest {
  query: string; // User's question (1-1000 characters, validated by frontend)
}

export interface BackendQueryResponse {
  answer: string; // Grounded answer or refusal message
  citations: BackendCitation[]; // Attribution sources (may be empty for refusals)
  timestamp: number; // Unix epoch seconds
}

export interface BackendCitation {
  chapter: string | null; // e.g., "Chapter 3: Perception"
  section: string | null; // e.g., "3.2 Computer Vision"
  source_url: string | null; // Full URL to textbook page
  referenced_text: string | null; // Excerpt from source
}

export interface APIError {
  type: 'network' | 'timeout' | 'http' | 'validation';
  message: string; // User-friendly error message
  statusCode?: number; // HTTP status (for 'http' type)
  details?: string; // Technical details (for debugging, not shown to user)
}
