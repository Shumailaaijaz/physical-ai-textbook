# Data Model: Frontend ↔ Backend Integration

**Feature**: Frontend ↔ Backend Integration
**Date**: 2025-12-26
**Phase**: 1 (Design & Contracts)

## Frontend-Backend Communication Models

### Request Models

#### BackendQueryRequest

Sent from frontend to backend when user submits a query.

```typescript
interface BackendQueryRequest {
  query: string;  // User's question (1-1000 characters, validated by frontend)
}
```

**Validation** (frontend-side, already exists in `lib/validation.ts`):
- Min length: 1 character (after trim)
- Max length: 1000 characters
- Required field: `query`

**Example**:
```json
{
  "query": "What is Physical AI?"
}
```

---

### Response Models

#### BackendQueryResponse

Received from backend on successful query processing.

```typescript
interface BackendQueryResponse {
  answer: string;           // Grounded answer or refusal message
  citations: BackendCitation[];  // Attribution sources (may be empty for refusals)
  timestamp: number;        // Unix epoch seconds
}
```

**Validation** (frontend-side, before setState):
- Required field: `answer` (must be non-empty string)
- Required field: `citations` (must be array, can be empty)
- Optional field: `timestamp` (defaults to Date.now() if missing)

**Example - Success**:
```json
{
  "answer": "Physical AI refers to embodied artificial intelligence systems that interact with the physical world through robotics and sensor integration...",
  "citations": [
    {
      "chapter": "Chapter 1: Introduction to Physical AI",
      "section": "1.1 Defining Physical AI",
      "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/intro/physical-ai",
      "referenced_text": "Physical AI systems combine perception, reasoning, and actuation..."
    }
  ],
  "timestamp": 1703620800
}
```

**Example - Refusal**:
```json
{
  "answer": "The provided book content does not contain sufficient information to answer this question.",
  "citations": [],
  "timestamp": 1703620805
}
```

#### BackendCitation

Source attribution for grounded answers.

```typescript
interface BackendCitation {
  chapter: string | null;           // e.g., "Chapter 3: Perception"
  section: string | null;           // e.g., "3.2 Computer Vision"
  source_url: string | null;        // Full URL to textbook page
  referenced_text: string | null;   // Excerpt from source
}
```

**Note**: All fields are nullable - backend may not provide complete citation data. Frontend must handle null values gracefully.

---

### Error Models

#### APIError

Frontend-side error representation for network/HTTP failures.

```typescript
interface APIError {
  type: 'network' | 'timeout' | 'http' | 'validation';
  message: string;          // User-friendly error message
  statusCode?: number;      // HTTP status (for 'http' type)
  details?: string;         // Technical details (for debugging, not shown to user)
}
```

**Error Type Mapping**:

| Type | Trigger | User Message | Example |
|------|---------|--------------|---------|
| `network` | `TypeError` from fetch | "Unable to connect to server. Please try again." | DNS failure, no internet |
| `timeout` | AbortController timeout | "Request timed out. Please try again." | >30s response time |
| `http` | 4xx/5xx status | "Server error. Please try again later." | 500 Internal Server Error |
| `validation` | Missing required fields | "Invalid response from server." | Missing `answer` field |

**Example**:
```typescript
{
  type: 'timeout',
  message: 'Request timed out. Please try again.',
  details: 'AbortController aborted request after 30000ms'
}
```

---

## Frontend State Models

### Updated ChatState

Existing `ChatState` interface (from `types/chat.ts`) will be extended to handle backend responses:

```typescript
interface ChatState {
  query: string;                      // EXISTING: User input
  isSubmitting: boolean;              // EXISTING: Loading state
  error: string | null;               // EXISTING: Error message
  submittedQuery: ChatQuery | null;   // EXISTING: Last submitted query
  response: ChatResponse | null;      // MODIFIED: Will receive backend data
}
```

**Changes**:
- `response` field will now be populated from `BackendQueryResponse`
- `isSubmitting` will be `true` during fetch, `false` on response/error

### Updated ChatResponse

Existing `ChatResponse` interface will match backend format:

```typescript
interface ChatResponse {
  text: string;              // Maps to BackendQueryResponse.answer
  citations?: Citation[];    // Maps to BackendQueryResponse.citations
  timestamp: number;         // Maps to BackendQueryResponse.timestamp
}
```

**Mapping**:
- `text` ← `answer` (backend field name)
- `citations` ← `citations` (same name)
- `timestamp` ← `timestamp` (or Date.now() if missing)

### Existing Citation Interface

```typescript
interface Citation {
  chapter: string | null;
  section: string | null;
  source_url: string | null;
  referenced_text: string | null;
}
```

**Note**: This already matches `BackendCitation` format - no changes needed!

---

## Data Flow

### Query Submission Flow

```
User Input (ChatInput)
  ↓
Frontend Validation (lib/validation.ts)
  ↓
BackendQueryRequest { query: "..." }
  ↓
fetch POST to ${NEXT_PUBLIC_API_URL}/query
  ↓
[Network Transit - 30s timeout]
  ↓
BackendQueryResponse { answer, citations, timestamp }
  ↓
Response Validation (lib/api.ts)
  ↓
ChatResponse { text, citations, timestamp }
  ↓
setState in ChatContainer
  ↓
Display in ResponseDisplay
```

### Error Flow

```
fetch() throws Error
  ↓
Error Type Detection (instanceof checks)
  ↓
APIError { type, message }
  ↓
setState({ error: message })
  ↓
Display in ErrorMessage component
```

---

## Validation Rules

### Frontend Validation (Before API Call)

Implemented in `lib/validation.ts` (already exists):
- Query length: 1-1000 characters
- Query is trimmed before validation

### Response Validation (After API Call)

Implemented in `lib/api.ts` (new file):

```typescript
function validateBackendResponse(data: any): BackendQueryResponse {
  // Required: answer field
  if (typeof data.answer !== 'string' || data.answer.trim().length === 0) {
    throw new Error('Invalid response: missing answer field');
  }

  // Required: citations array (can be empty)
  if (!Array.isArray(data.citations)) {
    throw new Error('Invalid response: citations must be an array');
  }

  // Optional: timestamp (default to now)
  const timestamp = typeof data.timestamp === 'number'
    ? data.timestamp
    : Date.now();

  return {
    answer: data.answer,
    citations: data.citations,
    timestamp
  };
}
```

---

## Edge Cases

### Malformed Response

**Scenario**: Backend returns `{}`

**Handling**: Validation throws error → APIError type='validation' → "Invalid response from server."

### Partial Citations

**Scenario**: Backend returns citation with only `chapter`, other fields `null`

**Handling**: Frontend displays partial citation (e.g., "Chapter 1" without section/URL)

### Empty Answer

**Scenario**: Backend returns `{ answer: "", citations: [] }`

**Handling**: Validation fails (empty answer after trim) → error message

### Very Long Answer

**Scenario**: Backend returns 10,000 character answer

**Handling**: Display full answer (no truncation) - UI should handle with scrolling

---

## Type Safety

All interfaces must be:
- Exported from `types/chat.ts`
- Used with TypeScript strict mode
- No `any` types allowed

**Example Import**:
```typescript
import type {
  BackendQueryRequest,
  BackendQueryResponse,
  BackendCitation,
  APIError
} from '@/types/chat';
```
