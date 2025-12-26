---
id: 003
title: Frontend Backend Integration Tasks Generation
stage: tasks
date: 2025-12-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: frontend-backend-integration
branch: 006-frontend-backend-integration
user: developer
command: /sp.tasks
labels: ["tasks", "frontend", "backend", "api-integration", "implementation", "concise"]
links:
  spec: specs/006-frontend-backend-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-frontend-backend-integration/tasks.md
tests:
  - Manual Testing Strategy: 3 user stories with independent test criteria
  - Total Tasks: 22 (17 implementation + 5 testing)
  - Parallel Opportunities: 2 groups identified (type definitions + US1/US3)
  - MVP Scope: Phase 1-4 (T001-T017) for P1 stories
---

## Prompt

/sp.tasks generate tasks be concise

## Response snapshot

Created comprehensive task breakdown for Frontend ↔ Backend Integration with 22 tasks across 6 phases.

**Task Overview**:
- **Total Tasks**: 22 (17 implementation + 5 testing/polish)
- **P1 Tasks**: 13 (US1 Query Submission + US3 Error Handling)
- **P2 Tasks**: 4 (US2 Environment Switching)
- **Parallel Opportunities**: 2 groups (type definitions T003-T006 can be done together; US1 and US3 can be developed in parallel)
- **MVP Scope**: Phase 1-4 (T001-T017) delivers both P1 stories

**Phase Breakdown**:

**Phase 1 - Setup** (2 tasks):
- T001: Create `.env.local` with `NEXT_PUBLIC_API_URL`
- T002: Create `.env.example` documenting environment variables

**Phase 2 - Foundation** (4 tasks):
- T003-T006: Add TypeScript interfaces to `types/chat.ts` (BackendQueryRequest, BackendQueryResponse, BackendCitation, APIError)

**Phase 3 - US1: Query Submission** (7 tasks):
- T007-T010: Create `lib/api.ts` with submitQuery(), fetch POST, AbortController timeout, response validation
- T011-T012: Update ChatContainer.tsx with API call and loading state
- T013: Update ResponseDisplay.tsx to display backend citations

**Phase 4 - US3: Error Handling** (4 tasks):
- T014-T017: Add error handling for network, timeout, HTTP, and validation errors

**Phase 5 - US2: Environment Switching** (3 tasks):
- T018: Implement fallback logic (NEXT_PUBLIC_API_URL || HF Spaces URL)
- T019-T020: Manual testing for local and HF backend routing

**Phase 6 - Polish** (2 tasks):
- T021-T022: Update README.md with API integration docs and troubleshooting

**Independent Test Criteria**:

Each user story has detailed manual test procedures:

**US1 - Query Submission**:
```bash
# Start backend + frontend
# Submit "What is Physical AI?"
# Verify: Response displays with citations in <10s
```

**US3 - Error Handling**:
- Test 1: Network error (disconnect internet)
- Test 2: Timeout (slow endpoint, >30s)
- Test 3: HTTP error (backend returns 500)
- Test 4: Validation error (malformed JSON)

**US2 - Environment Switching**:
- Test 1: Local backend routing (NEXT_PUBLIC_API_URL=localhost:8000)
- Test 2: HF backend routing (no env var = defaults to HF Spaces)

**File Modifications** (7 files):
1. `frontend/types/chat.ts` - Add 4 interfaces
2. `frontend/lib/api.ts` - NEW: API service file
3. `frontend/components/ChatContainer.tsx` - Add API call
4. `frontend/components/ResponseDisplay.tsx` - Display citations
5. `frontend/.env.local` - Environment configuration
6. `frontend/.env.example` - NEW: Documentation
7. `frontend/README.md` - Integration docs

**Dependency Graph**:
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

**Key Design Decisions**:
- Native fetch API (no axios/ky) - zero new dependencies
- AbortController for 30s timeout
- Granular error types with user-friendly messages
- Response validation before setState to prevent UI crashes
- Manual testing only (no automated test framework)

**Parallelization Strategy**:
- Type definitions (T003-T006) can be implemented together
- US1 (T007-T013) and US3 (T014-T017) can be developed in parallel after Foundation phase

**Testing Strategy**: Manual testing only per plan.md constraints. Each story has independent test procedures with clear pass criteria.

## Outcome

- ✅ Impact: Created actionable task breakdown for 3 user stories (US1, US2, US3) with 22 tasks across 6 phases
- 🧪 Tests: Defined manual test criteria for each story with specific pass/fail conditions
- 📁 Files: 1 created (tasks.md with 22 tasks, dependency graph, test procedures)
- 🔁 Next prompts: `/sp.implement` to execute tasks, or start with Phase 1 setup tasks (T001-T002)
- 🧠 Reflection: Concise format achieved - each task is one-line with file path, parallelization opportunities identified

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation completed successfully with all required sections
- Graders run and results (PASS/FAIL): PASS - All tasks have clear acceptance criteria, file paths, and test procedures
- Prompt variant (if applicable): Concise format requested and delivered (one-line task descriptions)
- Next experiment (smallest change to try): Consider auto-generating task IDs during /sp.implement to track completion progress
