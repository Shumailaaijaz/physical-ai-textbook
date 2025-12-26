# Feature Specification: FastAPI Backend Integration with Docusaurus Frontend

**Feature Branch**: `main`
**Created**: 2025-12-26
**Status**: Draft - Pending Clarification
**Input**: User description: "Frontend-Backend Integration with FastAPI - confirm existing chatbot UI in docs (docusaurus) is used as-is, create 'api.py' at project root and set up FastAPI server, expose a query endpoint that calls the agent from 'agent.py', Return agent responses to the frontend via json"

## Clarifications

### Session 2025-12-26

- Q: What should be the API endpoint path for queries? → A: `/chat` (conversational chat endpoint matching chatbot use case)
- Q: What port should the FastAPI server run on? → A: Port 8000 (FastAPI/Uvicorn default)
- Q: What is the Docusaurus frontend origin for CORS configuration? → A: http://localhost:3000 (Docusaurus default dev server port)
- Q: How should the Docusaurus chatbot UI be configured to point to the API endpoint? → A: Environment variable in Docusaurus config (e.g., REACT_APP_API_URL)
- Q: What JSON response format should the API return? → A: Return agent.py output as-is (GroundedAnswer/RefusalMessage structure)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Query Textbook via Docusaurus UI (Priority: P1)

A user visits the Docusaurus documentation site, types a question about the Physical AI textbook in the existing chatbot UI, and receives a grounded answer with citations.

**Why this priority**: This is the core functionality - enabling the existing Docusaurus chatbot UI to communicate with the backend RAG system.

**Independent Test**: Can be fully tested by loading the Docusaurus page, submitting a query through the existing UI, and verifying the response contains a grounded answer with citations.

**Acceptance Scenarios**:

1. **Given** existing Docusaurus chatbot UI is loaded, **When** user submits query "What is Physical AI?", **Then** FastAPI backend processes request and returns grounded answer with citations
2. **Given** user submits query with selected text, **When** request includes selected_text parameter, **Then** backend uses selected text for context
3. **Given** an out-of-scope query, **When** backend determines insufficient grounding, **Then** refusal message is returned to frontend

---

### User Story 2 - Handle Backend Errors Gracefully (Priority: P2)

When backend encounters errors (Qdrant timeout, agent failure), the Docusaurus UI displays appropriate error messages.

**Why this priority**: Important for user experience but doesn't affect core query functionality for valid requests.

**Independent Test**: Can be tested by simulating backend failures and verifying error responses are properly displayed in Docusaurus UI.

**Acceptance Scenarios**:

1. **Given** Qdrant connection fails, **When** user submits query, **Then** error response with clear message is returned
2. **Given** malformed JSON request, **When** backend receives invalid payload, **Then** 400 error with validation details is returned

---

### Edge Cases

- What happens when Qdrant connection times out during query processing?
- How does Docusaurus UI handle slow responses (5+ seconds)?
- What happens when environment variables are missing?
- How does system respond when agent.py fails?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create api.py file at project root containing FastAPI application
- **FR-002**: System MUST expose a chat endpoint (POST /chat) accepting JSON requests with query text
- **FR-003**: System MUST call agent.py functions to process queries using existing RAG pipeline
- **FR-004**: System MUST return JSON responses matching agent.py native output format (GroundedAnswer with text/citations or RefusalMessage with reason/type)
- **FR-005**: System MUST return refusal messages when grounding is insufficient
- **FR-006**: System MUST configure CORS to allow requests from Docusaurus frontend origin (http://localhost:3000 for development)
- **FR-007**: System MUST handle errors gracefully and return structured error responses
- **FR-008**: Docusaurus chatbot UI MUST be used as-is with only environment variable configuration for API endpoint (e.g., REACT_APP_API_URL=http://localhost:8000)
- **FR-009**: System MUST load configuration from .env file
- **FR-010**: System MUST support selected text parameter for contextual queries

### Key Entities *(include if feature involves data)*

- **ChatRequest** (API Input): User query (required string), selected text (optional string), session_id (optional string)
- **GroundedAnswer** (from agent.py): Answer text, citations array (chapter, section, URL, referenced_text), mode (standard_rag | selected_text_only)
- **RefusalMessage** (from agent.py): Refusal reason message, refusal_type (empty_retrieval | low_relevance | insufficient_grounding | selected_text_missing)
- **ErrorResponse** (API layer): Error message, error type, HTTP status code

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Docusaurus frontend can successfully send queries to FastAPI backend and receive responses
- **SC-002**: 95% of valid queries return grounded answers within 5 seconds
- **SC-003**: All refusals from answer agent are properly returned to frontend
- **SC-004**: API endpoint is accessible from Docusaurus origin (CORS configured correctly)
- **SC-005**: Error responses contain actionable error messages for debugging

## Dependencies

- **agent.py**: Existing answer generation agent (SPEC3) with OpenAI Agents SDK
- **retrieve.py**: Existing retriever agent (SPEC2) for vector search
- **Qdrant**: Vector database for textbook content retrieval
- **Cohere**: Embedding generation service
- **Docusaurus**: Existing documentation site with chatbot UI component

## Assumptions

- Docusaurus chatbot UI component already exists and can be configured via environment variable (REACT_APP_API_URL) to point to new API endpoint
- agent.py contains all necessary RAG logic (retrieval + answer generation)
- Environment variables are configured in .env file (OPENROUTER_API_KEY, QDRANT_URL, etc.)
- Backend will run locally during development on port 8000 (http://localhost:8000)
- CORS origin for Docusaurus development is http://localhost:3000 (production origin can be configured via environment variable)

## Constraints

- Must use existing agent.py without major modifications
- Must use existing Docusaurus UI without rebuilding frontend
- API file must be named api.py and placed at project root
- No authentication required for v1.0
- No session management in initial version