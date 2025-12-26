---
id: 001
title: Frontend Backend Integration Specification
stage: spec
date: 2025-12-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: frontend-backend-integration
branch: 006-frontend-backend-integration
user: developer
command: /sp.specify
labels: ["spec", "frontend", "backend", "api-integration", "hf-backend", "error-handling"]
links:
  spec: specs/006-frontend-backend-integration/spec.md
  plan: null
  tasks: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-frontend-backend-integration/spec.md
  - specs/006-frontend-backend-integration/checklists/requirements.md
tests:
  - Specification quality checklist validation (14/14 items PASS)
  - Technology-agnostic success criteria (0 implementation details)
  - Testable functional requirements (12/12 validated)
  - Independent user stories (3 stories with P1/P2 priorities)
---

## Prompt

/sp.specify Frontend ↔ HF Backend Integration
You are a full-stack integration agent responsible for connecting the frontend UI to the Hugging Face–hosted FastAPI backend.

Integration Targets:
- Frontend: http://localhost:3000
- Backend: https://huggingface.co/spaces/shumailaaijaz/hackathon-book?logs=container

Responsibilities:
- Implement API calling logic from frontend to backend
- Use environment variables for backend URL: NEXT_PUBLIC_API_URL
- Support switching between local backend (development) and HF backend (production)

Constraints:
- Do not modify backend logic
- Assume backend CORS is configured
- Handle JSON requests, JSON responses, and network errors

Success Criteria:
- User query flows: Browser → Frontend → HF Backend → RAG Agent → Frontend
- Answer displays correctly in UI
- No CORS or network failures

## Response snapshot

Created comprehensive specification for Frontend ↔ Backend Integration (SPEC 006) with environment-based backend switching and robust error handling.

**Specification Overview**:

**3 User Stories** (Prioritized for independent delivery):
1. **P1 - Query Submission to Backend**: Core integration connecting UI to HF backend
   - Submit query → send to HF backend → display answer with citations
   - Loading indicator during processing
   - Independent test: Submit query, verify response from HF backend displays correctly
2. **P2 - Environment-Based Backend Switching**: Flexible dev/prod configuration
   - Change NEXT_PUBLIC_API_URL → queries route to correct backend
   - Defaults to HF backend when not set
   - Independent test: Change env variable, verify requests go to correct endpoint
3. **P1 - Network Error Handling**: Production-ready error handling
   - Backend unavailable → clear error message ("Unable to connect")
   - HTTP errors (4xx/5xx) → specific error messages
   - Timeout after 30s → timeout error message
   - Independent test: Simulate network failure, verify graceful error display

**12 Functional Requirements** (All testable and unambiguous):
- FR-001: Send queries from frontend to configured backend API endpoint
- FR-002: Use NEXT_PUBLIC_API_URL environment variable for backend URL
- FR-003: Default to HF backend URL when NEXT_PUBLIC_API_URL not set
- FR-004: Send queries as JSON with expected backend schema
- FR-005: Parse JSON responses and extract answer text and citations
- FR-006: Display loading state while waiting for response
- FR-007: Handle network errors (connection failure, timeout, DNS) with user-friendly messages
- FR-008: Handle HTTP error responses (4xx, 5xx) appropriately
- FR-009: Validate backend response contains expected fields before rendering
- FR-010: Clear previous error messages on new successful query
- FR-011: Allow retry of failed requests without page refresh
- FR-012: Timeout requests after 30 seconds

**5 Success Criteria** (Technology-agnostic, measurable):
- SC-001: Users receive answers from HF backend within 10 seconds (normal conditions)
- SC-002: 95% of valid queries result in successful responses (no client-side errors)
- SC-003: Network errors displayed to users within 2 seconds
- SC-004: Developers can switch backends by changing one environment variable
- SC-005: Error messages are clear and actionable for users

**6 Edge Cases Identified**:
- Malformed JSON or unexpected response structure
- Very slow backend responses (10+ seconds)
- Invalid NEXT_PUBLIC_API_URL format
- 200 OK with error message in response body
- Network connection drops mid-request
- CORS errors from backend

**6 Assumptions Documented**:
- HF backend has CORS configured for localhost:3000
- Backend accepts POST requests with JSON body (query field)
- Backend returns JSON with answer/text, citations array, timestamp
- 30-second timeout acceptable for UX
- Existing ChatState/ChatResponse interfaces adaptable to backend schema
- Network errors should be retryable

**Out of Scope** (8 items):
- Backend API logic modifications
- Authentication/authorization
- Rate limiting on client side
- Response caching
- Exponential backoff retry logic
- Offline support
- API request analytics/logging
- Backend health monitoring

**Validation Results**:
✅ All 14 checklist items passed
✅ No implementation details (Next.js, fetch API, axios not mentioned)
✅ Technology-agnostic success criteria (measurable time/percentage metrics)
✅ Clear scope boundaries (Assumptions and Out of Scope sections)
✅ Ready for `/sp.plan` without clarifications needed

**Key Decisions**:
- 30-second request timeout for balance between patience and feedback
- Manual retry only (no auto-retry) to avoid hammering failing backend
- Default to HF backend URL for production-first approach
- User-friendly error messages over technical details
- Validation of response structure before rendering to prevent UI crashes
