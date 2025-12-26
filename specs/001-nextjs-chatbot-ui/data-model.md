# Data Model: Next.js Chatbot UI

**Feature**: Next.js Chatbot UI for RAG System
**Created**: 2025-12-26

## Overview

This document defines the TypeScript interfaces and types for the chatbot UI. The data model is kept minimal to support simple query submission and display without backend integration in the initial phase.

## Core Entities

### ChatQuery

Represents a user's submitted query.

```typescript
interface ChatQuery {
  text: string;         // Query text (1-1000 characters, trimmed)
  timestamp: number;    // Submission timestamp (Date.now())
}
```

**Validation Rules**:
- `text`: Required, non-empty after trimming, max 1000 characters
- `timestamp`: Auto-generated on submission

**Usage**: Stored in component state after successful submission, displayed in ResponseDisplay component.

---

### ChatResponse

Represents a response from the backend (placeholder for future use).

```typescript
interface ChatResponse {
  text: string;             // Response text from backend
  citations?: Citation[];   // Optional citations array
  timestamp: number;        // Response timestamp
}
```

**Fields**:
- `text`: Response content (future: from FastAPI backend)
- `citations`: Optional array of source citations (future: from RAG system)
- `timestamp`: When response was received

**Current Phase**: Not used (no backend integration yet). Component shows placeholder text instead.

---

### Citation

Represents a source citation for RAG responses (future use).

```typescript
interface Citation {
  chapter: string | null;
  section: string | null;
  source_url: string | null;
  referenced_text: string | null;
}
```

**Fields**:
- `chapter`: Book chapter reference (e.g., "Chapter 1: Introduction to Physical AI")
- `section`: Section within chapter (e.g., "Learning Objectives")
- `source_url`: Full URL to source content
- `referenced_text`: Snippet of referenced text

**Current Phase**: Type defined but not used. Will be rendered in ResponseDisplay when backend integration is added.

---

### ChatState

UI state for the chat interface (React component state).

```typescript
interface ChatState {
  query: string;                     // Current input text
  isSubmitting: boolean;             // Loading state during submission
  error: string | null;              // Error message (null if no error)
  submittedQuery: ChatQuery | null;  // Last submitted query
  response: ChatResponse | null;     // Backend response (null initially)
}
```

**State Fields**:
- `query`: Controlled input value, updates on every keystroke
- `isSubmitting`: True while processing submission (shows loading indicator)
- `error`: Validation or submission error message (cleared on successful submit)
- `submittedQuery`: Last successfully submitted query (displayed in ResponseDisplay)
- `response`: Backend response (null in current phase, placeholder shown instead)

**State Transitions**:

```
Initial State:
{
  query: '',
  isSubmitting: false,
  error: null,
  submittedQuery: null,
  response: null
}

User types "What is Physical AI?" → query: "What is Physical AI?"

User clicks submit (validation passes):
→ isSubmitting: true
→ error: null
→ submittedQuery: { text: "What is Physical AI?", timestamp: 1735234567890 }
→ isSubmitting: false

User submits empty query:
→ error: "Please enter a question"
→ isSubmitting: false (no submission occurred)

User submits 1001 character query:
→ error: "Question must be less than 1000 characters"
→ isSubmitting: false
```

---

### ValidationResult

Result of input validation.

```typescript
interface ValidationResult {
  isValid: boolean;
  error: string | null;
}
```

**Fields**:
- `isValid`: True if input passes validation
- `error`: Error message if invalid, null if valid

**Usage**: Returned by `validateQuery()` function in `lib/validation.ts`.

**Examples**:
```typescript
// Valid query
validateQuery("What is Physical AI?")
→ { isValid: true, error: null }

// Empty query
validateQuery("   ")
→ { isValid: false, error: "Please enter a question" }

// Too long
validateQuery("A".repeat(1001))
→ { isValid: false, error: "Question must be less than 1000 characters" }
```

## Type Hierarchy

```
ChatState (root component state)
  ├── query: string
  ├── isSubmitting: boolean
  ├── error: string | null
  ├── submittedQuery: ChatQuery | null
  │   ├── text: string
  │   └── timestamp: number
  └── response: ChatResponse | null  (future)
      ├── text: string
      ├── citations?: Citation[]
      │   ├── chapter: string | null
      │   ├── section: string | null
      │   ├── source_url: string | null
      │   └── referenced_text: string | null
      └── timestamp: number
```

## Component Props

### ChatContainer

**Props**: None (root component)

**State**: Uses ChatState interface

---

### ChatInput

```typescript
interface ChatInputProps {
  value: string;                      // Current query text
  onChange: (text: string) => void;   // Text change handler
  onSubmit: () => void;               // Submit handler
  isSubmitting: boolean;              // Loading state
  disabled?: boolean;                 // Optional: disable input
}
```

**Usage**:
```tsx
<ChatInput
  value={state.query}
  onChange={(text) => setState({ ...state, query: text })}
  onSubmit={handleSubmit}
  isSubmitting={state.isSubmitting}
/>
```

---

### ResponseDisplay

```typescript
interface ResponseDisplayProps {
  query: ChatQuery | null;       // Submitted query
  response: ChatResponse | null; // Backend response (future)
  isLoading: boolean;             // Show loading indicator
}
```

**Rendering Logic**:
- `query === null`: Show empty state ("Ask a question to get started")
- `query !== null && isLoading`: Show query + loading spinner
- `query !== null && response === null`: Show query + placeholder ("Waiting for backend integration...")
- `query !== null && response !== null`: Show query + response (future)

**Usage**:
```tsx
<ResponseDisplay
  query={state.submittedQuery}
  response={state.response}
  isLoading={state.isSubmitting}
/>
```

---

### ErrorMessage

```typescript
interface ErrorMessageProps {
  message: string | null;  // Error text
  onDismiss?: () => void;  // Optional dismiss handler
}
```

**Rendering**:
- `message === null`: Render nothing (component returns null)
- `message !== null`: Show error banner with dismiss button (if onDismiss provided)

**Usage**:
```tsx
<ErrorMessage
  message={state.error}
  onDismiss={() => setState({ ...state, error: null })}
/>
```

## Validation Constants

```typescript
// lib/validation.ts
const MIN_QUERY_LENGTH = 1;    // After trimming
const MAX_QUERY_LENGTH = 1000; // Character limit
```

**Rationale**:
- MIN_QUERY_LENGTH: Prevent empty submissions (whitespace-only queries)
- MAX_QUERY_LENGTH: Align with backend API limit (FR-007 in spec)

## Future Extensions

### Backend Integration Phase

When connecting to FastAPI backend, update ChatState handling:

```typescript
// lib/api.ts (future)
export async function submitQuery(query: string): Promise<ChatResponse> {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('Backend request failed');
  }

  return response.json();
}

// Update ChatContainer handleSubmit:
async function handleSubmit() {
  const validation = validateQuery(state.query);
  if (!validation.isValid) {
    setState({ ...state, error: validation.error });
    return;
  }

  setState({ ...state, isSubmitting: true, error: null });

  try {
    const chatQuery: ChatQuery = {
      text: state.query.trim(),
      timestamp: Date.now()
    };

    const response = await submitQuery(chatQuery.text);

    setState({
      ...state,
      isSubmitting: false,
      submittedQuery: chatQuery,
      response: response,
      query: '' // Clear input after successful submission
    });
  } catch (error) {
    setState({
      ...state,
      isSubmitting: false,
      error: 'Failed to get response. Please try again.'
    });
  }
}
```

### Chat History Phase

Add ChatMessage type for conversation history:

```typescript
interface ChatMessage {
  id: string;                  // Unique message ID
  query: ChatQuery;
  response: ChatResponse | null;
  status: 'pending' | 'success' | 'error';
}

interface ChatState {
  // ... existing fields
  messages: ChatMessage[];     // Conversation history
  currentMessageId: string | null; // Currently processing message
}
```

---

**Document Status**: Complete
**Last Updated**: 2025-12-26
