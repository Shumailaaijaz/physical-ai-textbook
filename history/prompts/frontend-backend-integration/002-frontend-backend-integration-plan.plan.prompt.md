---
id: 002
title: Frontend Backend Integration Implementation Plan
stage: plan
date: 2025-12-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: frontend-backend-integration
branch: 006-frontend-backend-integration
user: developer
command: /sp.plan
labels: ["plan", "frontend", "backend", "api-integration", "fetch-api", "error-handling", "environment-variables"]
links:
  spec: specs/006-frontend-backend-integration/spec.md
  plan: specs/006-frontend-backend-integration/plan.md
  tasks: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-frontend-backend-integration/plan.md
  - specs/006-frontend-backend-integration/research.md
  - specs/006-frontend-backend-integration/data-model.md
  - specs/006-frontend-backend-integration/quickstart.md
  - specs/006-frontend-backend-integration/contracts/backend-api.md
tests:
  - Constitution Check: 0 violations (native fetch API, no unnecessary dependencies)
  - Complexity Assessment: Single-file integration (lib/api.ts), no service layers needed
  - Research completed: 5 key decisions documented
  - Data model defined: 4 interfaces (BackendQueryRequest, BackendQueryResponse, BackendCitation, APIError)
  - API contract documented: POST /query endpoint with request/response schemas
---

## Prompt

/sp.plan You are a full-stack integration agent responsible for connecting an existing frontend UI to a Hugging Face–hosted FastAPI backend.

Integration Targets:
- Frontend (local development): http://localhost:3000
- Backend (production): https://huggingface.co/spaces/shumailaaijaz/hackathon-book

Objective: Establish a reliable, environment-aware connection between the frontend and the Hugging Face FastAPI backend so user queries can be sent to the RAG system and responses rendered in the UI.

Responsibilities:
- Implement frontend API-calling logic to the backend
- Use environment variables to configure backend URLs (NEXT_PUBLIC_API_URL)
- Support seamless switching between local backend (development) and Hugging Face backend (production)
- Ensure frontend properly handles JSON request payloads, JSON responses, and network/connectivity errors

Constraints:
- Do not modify backend logic or endpoints
- Assume backend CORS is correctly configured
- Frontend acts purely as a client/UI layer
- No authentication required at this stage

Execution Flow: Browser → Frontend UI → HF FastAPI Backend → RAG Agent → Frontend UI

Success Criteria:
- User query successfully sent from frontend to HF backend
- Backend response returned and displayed in UI
- Environment switching works without code changes
- No CORS, networking, or runtime errors occur

## Response snapshot

Created comprehensive implementation plan for Frontend ↔ Backend Integration with Phase 0 (Research) and Phase 1 (Design & Contracts) artifacts completed.

**Implementation Plan Overview**:

**Technical Context**:
- Language: TypeScript 5+ (Next.js 14.2.35)
- Dependencies: Native fetch API (zero new dependencies)
- Testing: Manual testing with real backend endpoints
- Performance: <10s response time, 30s timeout, <2s error display
- Scope: Single API endpoint integration, 1 service file (lib/api.ts)

**Constitution Check**: ✅ 0 Violations
- Uses native fetch API (no axios, no ky)
- No unnecessary abstraction layers
- Standard Next.js environment variable pattern
- Zero new dependencies

**Project Structure**:
- Frontend only (no backend modifications)
- Modified files: 6 (ChatContainer.tsx, ResponseDisplay.tsx, chat.ts, api.ts, .env.local, .env.example)
- New file: frontend/lib/api.ts (API service)

**Phase 0 - Research Completed**: [research.md](./research.md)
1. **API Client**: Native fetch + AbortController (zero dependencies)
2. **Environment Variables**: NEXT_PUBLIC_API_URL with HF Spaces fallback
3. **Error Handling**: Granular types (network/timeout/HTTP/validation)
4. **Response Validation**: Check required fields before setState
5. **Timeout**: 30s via AbortController

**Alternatives Rejected**:
- axios (unnecessary 13KB dependency)
- ky (overkill for single endpoint)
- React Query (no caching requirement)
- Global error boundary (errors are request-specific)

**Phase 1 - Design & Contracts**:

**Data Model** [data-model.md](./data-model.md):
1. `BackendQueryRequest`: `{ query: string }`
2. `BackendQueryResponse`: `{ answer: string, citations: Citation[], timestamp: number }`
3. `BackendCitation`: `{ chapter, section, source_url, referenced_text }` (all nullable)
4. `APIError`: `{ type: 'network'|'timeout'|'http'|'validation', message: string }`

**API Contract** [contracts/backend-api.md](./contracts/backend-api.md):
- Endpoint: POST `/query` (or `/`)
- Request: `{ "query": "..." }`
- Response (200): `{ "answer": "...", "citations": [...], "timestamp": 1703620800 }`
- Response (refusal): `{ "answer": "The provided book content does not contain sufficient information...", "citations": [] }`
- Errors: 400 Bad Request, 500 Internal Server Error

**Quickstart** [quickstart.md](./quickstart.md):
- Setup: Add `NEXT_PUBLIC_API_URL=http://localhost:8000` for local testing
- Or omit to use HF Spaces default
- Test: Submit "What is Physical AI?" → verify response with citations
- Troubleshooting: CORS, timeout, network errors covered

**Implementation Strategy**:

**MVP Scope (US1 + US3)**:
- Query submission with error handling
- Network/timeout/HTTP error handling
- Loading state during API call
- Response display with citations

**Phase A** (Minimum Viable):
- `lib/api.ts` with `submitQuery()` function
- Update `ChatContainer.tsx` to call API on submit
- Error handling (network, timeout, HTTP errors)
- **Testable**: Submit query, disconnect network, verify error message

**Phase B** (Environment Flexibility - US2):
- Add `NEXT_PUBLIC_API_URL` environment variable
- Default to HF Spaces URL when not set
- **Testable**: Change .env.local, restart, verify backend switch

**Dependencies & Risks**:
1. Backend CORS must allow localhost:3000 (assumed configured)
2. Backend deployed and accessible at HF Spaces URL
3. Unknown backend API contract - mitigated by research/testing
4. CORS failures - error handling for CORS errors
5. Response format mismatch - validation before setState

**Testing Strategy**:

**Manual Testing Checklist**:
- US1: Valid query → response displays with citations
- US1: Loading indicator shows during API call
- US2: Backend switching via env var works
- US3: Network error → "Unable to connect" error displays
- US3: Timeout (30s) → timeout error displays
- US3: HTTP 500 → "Server error" message displays
- US3: Malformed JSON → validation error displays
- US3: Dismiss error → can submit new query

**Integration Testing**:
1. End-to-end: Submit query → response displays within 10s
2. Error scenarios: Kill backend → network error displays
3. Backend switching: Local vs. HF Spaces routing verification

**Deliverables** (6 files):
1. `frontend/lib/api.ts` - API service with fetch + AbortController
2. `frontend/components/ChatContainer.tsx` - Add API call on submit
3. `frontend/components/ResponseDisplay.tsx` - Display backend citations
4. `frontend/types/chat.ts` - Add BackendQueryRequest/Response types
5. `frontend/.env.local` - Add NEXT_PUBLIC_API_URL
6. `frontend/.env.example` - Document environment variables

**Acceptance Criteria** (10 items):
1. ✅ User can submit query from frontend
2. ✅ Query sent to configured backend (HF or local)
3. ✅ Response displays with citations
4. ✅ Loading state shows during API call
5. ✅ Network errors display user-friendly messages
6. ✅ Timeout after 30s with error message
7. ✅ HTTP errors (4xx/5xx) handled gracefully
8. ✅ Environment variable switching works
9. ✅ Response validation prevents UI crashes
10. ✅ User can retry failed requests without page refresh

**Key Design Decisions**:
- Native fetch API (no dependencies) with AbortController for timeout
- NEXT_PUBLIC_API_URL environment variable with HF Spaces fallback (production-first)
- Granular error types with user-friendly messages (network/timeout/HTTP/validation)
- Response validation before setState to prevent UI crashes
- Manual retry only (no auto-retry to avoid hammering failing backend)

**Post-Implementation**:
- Update frontend/README.md with API integration docs
- Add .env.example with NEXT_PUBLIC_API_URL documentation
- Future enhancements: caching, exponential backoff, analytics (out of scope)

**Artifacts Created**:
- plan.md (this file) - Complete implementation plan
- research.md - 5 key decisions, alternatives rejected
- data-model.md - 4 interfaces, validation rules, edge cases
- quickstart.md - Setup, testing, troubleshooting guide
- contracts/backend-api.md - API endpoint specification

**Ready for**: `/sp.tasks` to generate actionable implementation tasks
