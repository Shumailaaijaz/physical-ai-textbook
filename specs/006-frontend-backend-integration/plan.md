# Implementation Plan: Frontend ↔ Backend Integration

**Branch**: `006-frontend-backend-integration` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-frontend-backend-integration/spec.md`

## Summary

Connect the existing Next.js frontend (localhost:3000) to the Hugging Face-hosted FastAPI RAG backend using environment-based configuration. Implement API calling logic with JSON request/response handling, 30-second timeout, comprehensive error handling, and environment variable switching between local and HF backends. Frontend acts purely as a client—no backend modifications.

## Technical Context

**Language/Version**: TypeScript 5+ (Next.js 14.2.35 frontend already exists)
**Primary Dependencies**: Next.js 14, React 18, native fetch API (no axios required)
**Storage**: N/A (stateless API calls only)
**Testing**: Manual testing with real backend endpoints (no test framework for MVP)
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge latest versions)
**Project Type**: Web application (frontend integration only, backend exists on HF Spaces)
**Performance Goals**: <10s response time from backend under normal conditions, error display within 2s
**Constraints**: 30s request timeout, no auth, no caching, CORS must be pre-configured on backend
**Scale/Scope**: Single API endpoint integration, 1 service file, environment-based configuration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Violations: None

This feature aligns with all constitution principles:

- **Accuracy through Primary Source Verification**: Integration follows Next.js official documentation for environment variables (NEXT_PUBLIC_*) and fetch API patterns
- **Clarity for Academic & Practitioner Audience**: Implementation plan targets developers with Next.js/React background
- **Reproducibility**: All dependencies versioned, environment setup documented
- **Rigor**: Standard REST API integration patterns from Next.js best practices
- **Practicality & Inclusivity**: Uses browser-native fetch API (no additional dependencies)

### Complexity Assessment

- **Project Type**: Single-file integration (no multi-project complexity)
- **Abstraction Layers**: Direct fetch calls (no service layer, no repository pattern needed)
- **State Management**: Existing React useState (no Redux/Zustand)
- **Dependencies**: Zero new dependencies (native fetch API)

**Justification for Simplicity**: This is a straightforward API client integration with existing UI components. Adding service layers, interceptors, or state management libraries would over-engineer a single-endpoint integration.

## Project Structure

### Documentation (this feature)

```text
specs/006-frontend-backend-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (backend API contract research)
├── data-model.md        # Phase 1 output (request/response models)
├── quickstart.md        # Phase 1 output (setup and testing guide)
├── contracts/           # Phase 1 output (API contract definition)
│   └── backend-api.md   # Documented backend endpoint schema
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── layout.tsx           # Existing (no changes)
│   ├── page.tsx             # Existing (no changes)
│   └── globals.css          # Existing (no changes)
├── components/
│   ├── ChatContainer.tsx    # MODIFY: Add API calling logic
│   ├── ChatInput.tsx        # Existing (no changes)
│   ├── ResponseDisplay.tsx  # MODIFY: Display citations from backend
│   └── ErrorMessage.tsx     # Existing (error handling already built)
├── types/
│   └── chat.ts              # MODIFY: Add backend response types
├── lib/
│   ├── validation.ts        # Existing (no changes)
│   └── api.ts               # CREATE: API service for backend calls
├── .env.local               # MODIFY: Add NEXT_PUBLIC_API_URL
└── .env.example             # CREATE: Document environment variables
```

**Structure Decision**: Web application (Option 2) - Frontend-only integration. Backend exists separately on Hugging Face Spaces. No backend/ directory needed as we're not modifying backend logic.

**Modified Files**:
1. `frontend/components/ChatContainer.tsx` - Add backend API call on submit
2. `frontend/components/ResponseDisplay.tsx` - Display backend citations
3. `frontend/types/chat.ts` - Add backend response types
4. `frontend/lib/api.ts` - NEW: API service file
5. `frontend/.env.local` - Add backend URL configuration
6. `frontend/.env.example` - NEW: Document env vars

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No violations. This is a standard frontend-to-backend integration using native browser APIs.

## Phase 0: Research & Decisions

**Research Completed**: [research.md](./research.md)

### Key Decisions

1. **API Client Choice**: Native fetch API (no axios/ky)
   - **Rationale**: fetch is built into browsers, zero dependencies, supports timeout via AbortController
   - **Alternatives considered**: axios (unnecessary dependency for single endpoint), ky (overkill)

2. **Environment Variable Strategy**: NEXT_PUBLIC_API_URL with fallback
   - **Rationale**: NEXT_PUBLIC_ prefix makes env var available in browser, required by Next.js
   - **Fallback**: HF Spaces URL as default for production deployment

3. **Error Handling Strategy**: Granular error types with user-friendly messages
   - **Rationale**: Network errors, timeouts, HTTP errors need different user messages
   - **Implementation**: try/catch with instanceof checks for TypeError (network), timeout detection

4. **Response Validation**: Validate backend response structure before setState
   - **Rationale**: Prevent UI crashes from malformed responses
   - **Implementation**: Check for required fields (answer/text, citations array) before rendering

5. **Citation Display**: Adapt existing ResponseDisplay to show backend citations
   - **Rationale**: ResponseDisplay already has citation logic, just needs backend data mapping
   - **Implementation**: Map backend citation format to existing Citation interface

## Phase 1: Design & Contracts

### Data Model

**See**: [data-model.md](./data-model.md)

**Key Entities**:
1. **BackendQueryRequest**: `{ query: string }`
2. **BackendCitation**: `{ chapter, section, source_url, referenced_text }`
3. **BackendQueryResponse**: `{ answer: string, citations: Citation[], timestamp: number }`
4. **APIError**: `{ type: 'network' | 'timeout' | 'http' | 'validation', message: string, statusCode?: number }`

### API Contracts

**See**: [contracts/backend-api.md](./contracts/backend-api.md)

**Backend Endpoint** (assumed based on user description):
- **URL**: `${NEXT_PUBLIC_API_URL}/query` (or root `/`)
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Request Body**: `{ "query": "What is Physical AI?" }`
- **Response (200)**: `{ "answer": "...", "citations": [...], "timestamp": 1703620800 }`
- **Response (4xx/5xx)**: Error handling with user-friendly messages

### Quickstart

**See**: [quickstart.md](./quickstart.md)

**Setup Steps**:
1. Add `NEXT_PUBLIC_API_URL=http://localhost:8000` to `.env.local` for local backend testing
2. Or omit to use HF Spaces backend (default): `https://huggingface.co/spaces/shumailaaijaz/hackathon-book`
3. Run `npm run dev` - frontend on localhost:3000
4. Test with query: "What is Physical AI?"
5. Verify response displays with citations

## Implementation Strategy

### MVP Scope (US1 + US3 from spec)

**Priority 1**: Query submission with error handling
- Implement `lib/api.ts` with `submitQuery()` function
- Update `ChatContainer.tsx` to call API on submit
- Handle network errors, timeouts, HTTP errors
- Display loading state during API call

**Priority 2**: Environment-based backend switching (US2)
- Add `NEXT_PUBLIC_API_URL` environment variable
- Default to HF Spaces URL when not set
- Document in `.env.example`

### Phased Delivery

**Phase A** (Minimum Viable): US1 + US3
- User can submit query → see backend response
- Error handling works (network, timeout, HTTP errors)
- **Testable independently**: Submit query, disconnect network, verify error message

**Phase B** (Environment Flexibility): US2
- Developer can switch backends via env var
- **Testable independently**: Change .env.local, restart dev server, verify backend switch

### Dependencies & Risks

**Dependencies**:
- Backend CORS must allow `localhost:3000` (assumed configured)
- Backend must be deployed and accessible at HF Spaces URL

**Risks**:
1. **Unknown backend API contract** - Need to research actual endpoint from HF Spaces logs/docs
   - **Mitigation**: Phase 0 research to document actual endpoint, request/response schema
2. **CORS not configured** - Requests may fail with CORS error
   - **Mitigation**: Error handling for CORS errors, clear error message to user
3. **Backend response format mismatch** - Citations may have different structure
   - **Mitigation**: Response validation before setState, graceful degradation if citations missing

## Testing Strategy

### Manual Testing Checklist

**US1 - Query Submission**:
- [ ] Submit valid query → response displays with citations
- [ ] Loading indicator shows during API call
- [ ] Response renders correctly in ResponseDisplay

**US2 - Backend Switching**:
- [ ] Set NEXT_PUBLIC_API_URL=http://localhost:8000 → requests go to local backend
- [ ] Unset NEXT_PUBLIC_API_URL → requests go to HF backend (default)
- [ ] Invalid URL format → error message displays

**US3 - Error Handling**:
- [ ] Disconnect network → "Unable to connect" error displays
- [ ] Point to invalid backend URL → timeout error after 30s
- [ ] Backend returns 500 → "Server error" message displays
- [ ] Backend returns malformed JSON → validation error message displays
- [ ] Dismiss error → can submit new query without page refresh

### Integration Testing

**End-to-End Flow**:
1. Start frontend: `npm run dev`
2. Submit query: "What is Physical AI?"
3. Verify: Response displays within 10s
4. Verify: Citations show chapter, section, source URL
5. Verify: No console errors

**Error Scenarios**:
1. Kill backend process → network error displays
2. Set invalid NEXT_PUBLIC_API_URL → timeout/network error
3. Backend returns `{"error": "..."}` → error message displays

## Post-Implementation

### Documentation Updates

1. Update `frontend/README.md` with:
   - `NEXT_PUBLIC_API_URL` environment variable documentation
   - Backend API integration section
   - Error handling behavior

2. Add `.env.example` with:
   - `NEXT_PUBLIC_API_URL` with comment explaining local vs. HF backend

### Future Enhancements (Out of Scope)

- Request/response caching
- Retry logic with exponential backoff
- Request queuing for multiple rapid submissions
- Analytics/logging of API requests
- Backend health check before query submission
- Optimistic UI updates

## Acceptance Criteria

**Feature Complete When**:

1. ✅ User can submit query from frontend
2. ✅ Query is sent to configured backend (HF Spaces or local)
3. ✅ Backend response displays in UI with citations
4. ✅ Loading state shows during API call
5. ✅ Network errors display user-friendly messages
6. ✅ Timeout after 30s with clear error message
7. ✅ HTTP errors (4xx/5xx) handled gracefully
8. ✅ Environment variable switching works (no code changes)
9. ✅ Response validation prevents UI crashes
10. ✅ User can retry failed requests without page refresh

**Deliverables**:
- [ ] `frontend/lib/api.ts` created
- [ ] `frontend/components/ChatContainer.tsx` updated with API call
- [ ] `frontend/components/ResponseDisplay.tsx` updated for backend citations
- [ ] `frontend/types/chat.ts` updated with backend response types
- [ ] `frontend/.env.local` contains NEXT_PUBLIC_API_URL
- [ ] `frontend/.env.example` documents environment variables
- [ ] Manual testing checklist completed
- [ ] README updated with integration documentation

## Notes

**Backend Endpoint Assumption**: This plan assumes the backend endpoint is either `/query` or `/` with POST method. Phase 0 research will verify the actual endpoint by:
1. Checking HF Spaces logs for the deployed backend
2. Reviewing any existing backend documentation
3. Testing with curl/Postman to verify request/response schema

**CORS Assumption**: Plan assumes CORS is pre-configured on the backend to allow `localhost:3000` and the HF Spaces origin. If CORS fails, error handling will display a clear message to the user.

**No Authentication**: Plan explicitly excludes authentication logic per spec constraints. Future phases may add API keys or token-based auth.
