# Tasks: Frontend ↔ Backend Integration

**Feature**: Frontend ↔ Backend Integration
**Branch**: `006-frontend-backend-integration`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Task Summary

**Total Tasks**: 17
**P1 Tasks**: 13 (US1 + US3)
**P2 Tasks**: 4 (US2)
**Parallel Opportunities**: 2 groups
**MVP Scope**: Phase 1-4 (US1 + US3)

## Dependency Graph

```
Setup (Phase 1)
  ↓
Foundation (Phase 2)
  ↓
┌─────────────┬──────────────┐
US1: Query    US3: Errors    US2: Env Switch
Submission    Handling       (P2 - Optional)
(P1)          (P1)
  ↓              ↓              ↓
└─────────────┴──────────────┘
  ↓
Polish (Phase 6)
```

**Story Completion Order**: US1 → US3 → US2 (US1 and US3 can be developed in parallel)

---

## Phase 1: Setup

### Environment Configuration

- [X] T001 [P1] [Setup] Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [X] T002 [P1] [Setup] Create `frontend/.env.example` documenting `NEXT_PUBLIC_API_URL` variable

**Test Criteria**:
- ✅ `.env.local` exists with correct variable
- ✅ `.env.example` documents production/local examples

---

## Phase 2: Foundation

### Type Definitions

- [X] T003 [P1] [Foundation] Add `BackendQueryRequest` interface to `frontend/types/chat.ts`
- [X] T004 [P1] [Foundation] Add `BackendQueryResponse` interface to `frontend/types/chat.ts`
- [X] T005 [P1] [Foundation] Add `BackendCitation` interface to `frontend/types/chat.ts`
- [X] T006 [P1] [Foundation] Add `APIError` interface to `frontend/types/chat.ts`

**Test Criteria**:
- ✅ All interfaces defined with strict types (no `any`)
- ✅ TypeScript compilation passes

---

## Phase 3: US1 - Query Submission (P1)

### API Service Implementation

- [X] T007 [P1] [US1] Create `frontend/lib/api.ts` with `submitQuery()` function
- [X] T008 [P1] [US1] Implement fetch POST to `${NEXT_PUBLIC_API_URL}/query` with JSON body
- [X] T009 [P1] [US1] Add AbortController timeout (30s) to `submitQuery()`
- [X] T010 [P1] [US1] Add response validation (check `answer` and `citations` fields)

### Frontend Integration

- [X] T011 [P1] [US1] Update `ChatContainer.tsx` to call `submitQuery()` on form submit
- [X] T012 [P1] [US1] Set `isSubmitting: true` before API call, `false` on response/error
- [X] T013 [P1] [US1] Update `ResponseDisplay.tsx` to display `citations` from backend

**Test Criteria**:
- ✅ Query "What is Physical AI?" returns response within 10s
- ✅ Loading indicator shows during API call
- ✅ Response displays answer text and citations
- ✅ Citations show chapter, section, source_url, referenced_text

---

## Phase 4: US3 - Error Handling (P1)

### Error Handling Implementation

- [X] T014 [P1] [US3] Add network error handling (catch `TypeError` → "Unable to connect to server")
- [X] T015 [P1] [US3] Add timeout error handling (catch `AbortError` → "Request timed out")
- [X] T016 [P1] [US3] Add HTTP error handling (4xx/5xx → "Server error. Please try again later.")
- [X] T017 [P1] [US3] Add validation error handling (missing fields → "Invalid response from server")

**Test Criteria**:
- ✅ Disconnect network → "Unable to connect to server" error displays
- ✅ Slow backend (>30s) → "Request timed out" error displays
- ✅ Backend returns 500 → "Server error" message displays
- ✅ Malformed JSON → "Invalid response" error displays
- ✅ Error messages are dismissible

---

## Phase 5: US2 - Environment Switching (P2)

### Environment Variable Logic

- [X] T018 [P2] [US2] Use `process.env.NEXT_PUBLIC_API_URL || 'https://huggingface.co/spaces/shumailaaijaz/hackathon-book'` in `api.ts`
- [X] T019 [P2] [US2] Test local backend: set `NEXT_PUBLIC_API_URL=http://localhost:8000`, restart, verify request goes to localhost
- [X] T020 [P2] [US2] Test HF backend: remove `NEXT_PUBLIC_API_URL`, restart, verify request goes to HF Spaces

**Test Criteria**:
- ✅ Local backend URL works when `NEXT_PUBLIC_API_URL` is set
- ✅ HF Spaces URL works when `NEXT_PUBLIC_API_URL` is unset
- ✅ Backend switching requires no code changes (only .env.local + restart)

---

## Phase 6: Polish

### Documentation

- [X] T021 [P2] [Polish] Update `frontend/README.md` with API integration section
- [X] T022 [P2] [Polish] Document troubleshooting steps for CORS, timeout, network errors

**Test Criteria**:
- ✅ README explains environment variable setup
- ✅ README links to quickstart.md and backend-api.md

---

## Independent Test Criteria by Story

### US1: Query Submission
**Testable Independently**: ✅ Yes (requires backend running)

**Manual Test**:
```bash
# Terminal 1: Start backend (local or use HF Spaces)
cd src/chatbot/backend
uvicorn api:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start frontend
cd frontend
npm run dev

# Browser: http://localhost:3000
1. Type: "What is Physical AI?"
2. Click Submit
3. Verify: Response displays with citations within 10s
```

**Pass Criteria**:
- ✅ Loading indicator shows
- ✅ Response appears in <10s
- ✅ Answer text displays
- ✅ Citations array displays (chapter, section, URL, text)

---

### US3: Error Handling
**Testable Independently**: ✅ Yes (can simulate errors)

**Manual Tests**:

**Test 1: Network Error**
```bash
1. Disconnect internet OR stop backend
2. Submit query
3. Verify: "Unable to connect to server. Please try again." error displays
```

**Test 2: Timeout**
```bash
1. Set NEXT_PUBLIC_API_URL to slow/unresponsive endpoint
2. Submit query
3. Wait 30+ seconds
4. Verify: "Request timed out. Please try again." error displays
```

**Test 3: HTTP Error**
```bash
1. Configure backend to return 500 error
2. Submit query
3. Verify: "Server error. Please try again later." error displays
```

**Test 4: Validation Error**
```bash
1. Mock backend to return { "invalid": "data" }
2. Submit query
3. Verify: "Invalid response from server." error displays
```

**Pass Criteria**:
- ✅ All 4 error types display correct messages
- ✅ Errors are dismissible (X button works)
- ✅ User can submit new query after error

---

### US2: Environment Switching
**Testable Independently**: ⚠️ Partial (depends on US1 working)

**Manual Test**:
```bash
# Test 1: Local Backend
1. Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000
2. Restart dev server: npm run dev
3. Submit query
4. Open browser DevTools → Network tab
5. Verify: Request goes to localhost:8000/query

# Test 2: HF Backend
1. Remove NEXT_PUBLIC_API_URL from .env.local
2. Restart dev server: npm run dev
3. Submit query
4. Verify: Request goes to https://huggingface.co/spaces/shumailaaijaz/hackathon-book/query
```

**Pass Criteria**:
- ✅ Local backend routing works
- ✅ HF backend routing works (default)
- ✅ No code changes required (only .env.local + restart)

---

## Notes

**Parallelization**:
- T003-T006 (type definitions) can be done together
- US1 (T007-T013) and US3 (T014-T017) can be developed in parallel after Foundation phase

**Manual Testing Only**: No automated test framework per plan.md (manual testing with real backend)

**File Modifications**:
1. `frontend/types/chat.ts` - Add 4 interfaces (T003-T006)
2. `frontend/lib/api.ts` - NEW file (T007-T010, T014-T017, T018)
3. `frontend/components/ChatContainer.tsx` - Add API call (T011-T012)
4. `frontend/components/ResponseDisplay.tsx` - Display citations (T013)
5. `frontend/.env.local` - Add env var (T001)
6. `frontend/.env.example` - NEW file (T002)
7. `frontend/README.md` - Documentation (T021-T022)

**MVP Scope**: T001-T017 (Phase 1-4) delivers US1 + US3 (both P1)
**Optional Enhancement**: T018-T020 (US2) adds environment switching flexibility
