# Feature Specification: Frontend ↔ Backend Integration

**Feature Branch**: `006-frontend-backend-integration`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "Frontend ↔ HF Backend Integration - Connect the frontend UI to the Hugging Face–hosted FastAPI backend"

## User Scenarios & Testing

### User Story 1 - Query Submission to Backend (Priority: P1)

A user visits the frontend at localhost:3000, types a question about Physical AI, submits it, and receives an AI-generated answer from the Hugging Face-hosted backend with citations.

**Why this priority**: This is the core value proposition - connecting the frontend to the RAG backend to deliver AI-powered answers. Without this, the application has no functional purpose.

**Independent Test**: Can be fully tested by submitting a query through the UI and verifying that the response from the HF backend appears correctly in the response display area. Delivers immediate user value by providing AI-generated answers.

**Acceptance Scenarios**:

1. **Given** the user is on the chatbot page, **When** they type "What is Physical AI?" and click submit, **Then** the query is sent to the HF backend and a response with citations is displayed
2. **Given** the user submits a query, **When** the backend returns a response, **Then** the response text and citations are correctly displayed in the UI
3. **Given** the user submits a query, **When** the backend is processing, **Then** a loading indicator shows "Submitting..." or similar feedback

---

### User Story 2 - Environment-Based Backend Switching (Priority: P2)

Developers can switch between local backend (development) and HF backend (production) by changing an environment variable, without code modifications.

**Why this priority**: Enables flexible development and testing workflows. Developers need to test against local backend during development, then seamlessly switch to production HF backend for deployment.

**Independent Test**: Can be tested by changing the NEXT_PUBLIC_API_URL environment variable and verifying that queries are routed to the correct backend endpoint. Does not require US1 to be fully polished, just API calling logic to exist.

**Acceptance Scenarios**:

1. **Given** NEXT_PUBLIC_API_URL is set to local backend URL, **When** a query is submitted, **Then** the request goes to the local backend
2. **Given** NEXT_PUBLIC_API_URL is set to HF backend URL, **When** a query is submitted, **Then** the request goes to the HF backend
3. **Given** NEXT_PUBLIC_API_URL is not set, **When** the app starts, **Then** it defaults to the HF backend URL

---

### User Story 3 - Network Error Handling (Priority: P1)

When the backend is unavailable or returns an error, users see a clear, actionable error message instead of a broken UI.

**Why this priority**: Critical for production readiness. Network failures are inevitable, and graceful error handling is essential for user trust and debugging.

**Independent Test**: Can be tested by disconnecting network, pointing to invalid backend URL, or simulating backend errors. Verifies that error states are handled gracefully without breaking the UI.

**Acceptance Scenarios**:

1. **Given** the backend is unreachable, **When** a user submits a query, **Then** an error message displays "Unable to connect to server. Please try again."
2. **Given** the backend returns a 500 error, **When** a user submits a query, **Then** an error message displays "Server error. Please try again later."
3. **Given** the backend request times out after 30 seconds, **When** a user is waiting for a response, **Then** an error message displays "Request timed out. Please try again."
4. **Given** an error occurs, **When** the user dismisses the error, **Then** they can submit a new query without refreshing the page

---

### Edge Cases

- What happens when the backend returns malformed JSON or unexpected response structure?
- How does the system handle very slow backend responses (10+ seconds)?
- What happens if NEXT_PUBLIC_API_URL is set to an invalid URL format?
- How does the system behave when the backend returns a 200 OK but with an error message in the response body?
- What happens when network connection drops mid-request?
- How does the system handle CORS errors from the backend?

## Requirements

### Functional Requirements

- **FR-001**: System MUST send user queries from the frontend to the configured backend API endpoint
- **FR-002**: System MUST use the NEXT_PUBLIC_API_URL environment variable to determine the backend URL
- **FR-003**: System MUST default to the HF backend URL (https://huggingface.co/spaces/shumailaaijaz/hackathon-book) when NEXT_PUBLIC_API_URL is not set
- **FR-004**: System MUST send queries as JSON in the request body with the expected backend schema
- **FR-005**: System MUST parse JSON responses from the backend and extract answer text and citations
- **FR-006**: System MUST display loading state while waiting for backend response
- **FR-007**: System MUST handle network errors (connection failure, timeout, DNS failure) with user-friendly messages
- **FR-008**: System MUST handle HTTP error responses (4xx, 5xx) with appropriate error messages
- **FR-009**: System MUST validate that the backend response contains the expected fields before rendering
- **FR-010**: System MUST clear previous error messages when a new successful query completes
- **FR-011**: System MUST allow users to retry failed requests without page refresh
- **FR-012**: System MUST timeout requests after 30 seconds to prevent indefinite waiting

### Key Entities

- **API Request**: Represents a user query sent to the backend, containing the query text and any required metadata
- **API Response**: Represents the backend's answer, containing response text, citations (chapter, section, source URL, referenced text), and timestamp
- **Backend Configuration**: The URL of the backend API, configured via environment variable, with fallback to HF production URL

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can submit a query and receive an answer from the HF backend within 10 seconds under normal conditions
- **SC-002**: 95% of valid queries result in successful responses from the backend (no client-side errors)
- **SC-003**: Network errors are displayed to users within 2 seconds of occurrence
- **SC-004**: Developers can switch between local and HF backends by changing one environment variable
- **SC-005**: Error messages are clear enough that users understand what went wrong and whether they should retry

## Assumptions

- The HF backend at https://huggingface.co/spaces/shumailaaijaz/hackathon-book has CORS configured to allow requests from localhost:3000
- The backend API accepts POST requests with JSON body containing a query field
- The backend API returns JSON responses with fields: `answer` (or `text`), `citations` (array), and `timestamp`
- Request/response timeout of 30 seconds is acceptable for user experience
- The existing ChatState and ChatResponse TypeScript interfaces from the frontend can be adapted to match the backend schema
- Network errors should be retryable - users expect to be able to try again after dismissing an error

## Out of Scope

- Modifying backend API logic or schema
- Authentication/authorization for API requests
- Rate limiting or request throttling on the client side
- Caching of responses
- Retry logic with exponential backoff (simple manual retry only)
- Offline support or service workers
- Analytics or logging of API requests
- Backend health check or status endpoint monitoring
