'use client';

import { useState } from 'react';
import { ChatState, APIError } from '@/types/chat';
import { validateQuery } from '@/lib/validation';
import { submitQuery } from '@/lib/api';
import ChatInput from '@/components/ChatInput';
import ResponseDisplay from '@/components/ResponseDisplay';
import ErrorMessage from '@/components/ErrorMessage';

/**
 * Main container component managing chat state and interactions.
 * Handles query submission, validation, and state management.
 *
 * @returns Chat container with input, error display, and response sections
 */
export default function ChatContainer() {
  const [state, setState] = useState<ChatState>({
    query: '',
    isSubmitting: false,
    error: null,
    submittedQuery: null,
    response: null,
  });

  const handleQueryChange = (text: string) => {
    setState((prev) => ({ ...prev, query: text, error: null }));
  };

  const handleSubmit = async () => {
    const validation = validateQuery(state.query);

    if (!validation.isValid) {
      setState((prev) => ({ ...prev, error: validation.error }));
      return;
    }

    const trimmedQuery = state.query.trim();
    const submittedQuery = {
      text: trimmedQuery,
      timestamp: Date.now(),
    };

    // Set loading state
    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      submittedQuery,
      query: '',
      error: null,
      response: null,
    }));

    try {
      // Call backend API
      const backendResponse = await submitQuery(trimmedQuery);

      // Transform backend response to ChatResponse format
      const response = {
        text: backendResponse.answer,
        citations: backendResponse.citations,
        timestamp: backendResponse.timestamp,
      };

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        response,
      }));
    } catch (error) {
      // Handle API errors
      const apiError = error as APIError;
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: apiError.message,
      }));
    }
  };

  const handleDismissError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Physical AI Chatbot
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6">
        Ask questions about Physical AI and robotics
      </p>

      <ErrorMessage message={state.error} onDismiss={handleDismissError} />

      <ChatInput
        value={state.query}
        onChange={handleQueryChange}
        onSubmit={handleSubmit}
        isSubmitting={state.isSubmitting}
      />

      <ResponseDisplay
        query={state.submittedQuery}
        response={state.response}
        isLoading={state.isSubmitting}
      />
    </div>
  );
}
