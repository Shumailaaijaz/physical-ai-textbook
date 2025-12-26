import { ValidationResult } from '@/types/chat';

const MIN_QUERY_LENGTH = 1;
const MAX_QUERY_LENGTH = 1000;

export function validateQuery(query: string): ValidationResult {
  const trimmed = query.trim();

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return {
      isValid: false,
      error: 'Please enter a question'
    };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      error: `Question must be less than ${MAX_QUERY_LENGTH} characters`
    };
  }

  return {
    isValid: true,
    error: null
  };
}
