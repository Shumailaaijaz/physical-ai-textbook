# Implementation Tasks: FastAPI Backend Integration with Docusaurus

**Feature**: FastAPI Backend Integration with Docusaurus Frontend
**Branch**: `main`
**Date**: 2025-12-26
**Spec**: [spec.md](./spec.md)

## Summary

Create api.py at project root with FastAPI server exposing POST /chat endpoint. Connect existing Docusaurus chatbot UI to backend using environment variable configuration. Return agent.py output as-is (GroundedAnswer/RefusalMessage) via JSON.

**Tech Stack**: Python 3.11, FastAPI, uvicorn, existing agent.py (OpenAI Agents SDK)
**Port**: 8000
**CORS Origin**: http://localhost:3000 (Docusaurus dev server)

## Implementation Strategy

**MVP Scope**: User Story 1 only (Phase 3)
- Delivers core functionality: query textbook via Docusaurus UI
- Independently testable
- Production-ready for basic queries

**Incremental Delivery**:
1. Phase 1-2: Setup + foundational infrastructure
2. Phase 3: US1 - Core query functionality (MVP)
3. Phase 4: US2 - Enhanced error handling

## Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2)
                                               ↓
                                           MVP Complete
```

**User Story Dependencies**:
- US1 (P1): No dependencies - can start after Phase 2
- US2 (P2): Depends on US1 (builds on existing error handling)

## Phase 1: Setup

**Goal**: Initialize project structure and install dependencies

- [ ] T001 Install FastAPI and uvicorn dependencies (add to requirements.txt or pyproject.toml)
- [ ] T002 Create api.py file at project root (D:\nativ-ai-web\website\api.py)
- [ ] T003 [P] Update .env.example with CORS_ORIGIN variable

## Phase 2: Foundational

**Goal**: Core FastAPI infrastructure that all user stories depend on

- [ ] T004 Initialize FastAPI app in api.py with CORS middleware for http://localhost:3000
- [ ] T005 [P] Create Pydantic models for ChatRequest in api.py (query, selected_text, session_id fields)
- [ ] T006 [P] Import existing agent functions from src/chatbot/backend/agent.py
- [ ] T007 Add environment loading from .env in api.py (OPENROUTER_API_KEY, QDRANT_URL, COHERE_API_KEY, CORS_ORIGIN)

## Phase 3: User Story 1 - Query Textbook via Docusaurus UI (P1)

**Story Goal**: Enable users to query Physical AI textbook through existing Docusaurus chatbot UI and receive grounded answers with citations.

**Independent Test Criteria**:
1. Start FastAPI server: `uvicorn api:app --port 8000`
2. Send POST to http://localhost:8000/chat with JSON: `{"query": "What is Physical AI?"}`
3. Verify response contains GroundedAnswer with text and citations array
4. Send query with selected_text parameter
5. Verify selected_text mode is used
6. Send out-of-scope query
7. Verify RefusalMessage is returned

**Implementation Tasks**:

- [ ] T008 [US1] Implement POST /chat endpoint in api.py calling agent functions from agent.py
- [ ] T009 [US1] Add request validation for ChatRequest in /chat endpoint (query required, max 1000 chars)
- [ ] T010 [US1] Return agent.py GroundedAnswer as JSON response (text, citations, mode fields)
- [ ] T011 [US1] Return agent.py RefusalMessage as JSON response when grounding insufficient
- [ ] T012 [US1] Add selected_text parameter support in /chat endpoint
- [ ] T013 [P] [US1] Configure Docusaurus .env with REACT_APP_API_URL=http://localhost:8000
- [ ] T014 [US1] Start FastAPI server with uvicorn on port 8000: `uvicorn api:app --host 0.0.0.0 --port 8000`
- [ ] T015 [US1] Verify end-to-end: Submit query through Docusaurus UI and confirm grounded answer displays

**Acceptance**: Query "What is Physical AI?" through Docusaurus returns grounded answer with citations from Physical AI textbook.

## Phase 4: User Story 2 - Handle Backend Errors Gracefully (P2)

**Story Goal**: When backend encounters errors (Qdrant timeout, agent failure), return clear error messages to Docusaurus UI.

**Independent Test Criteria**:
1. Simulate Qdrant connection failure
2. Verify 500 error with clear error message returned
3. Send malformed JSON to /chat
4. Verify 400 error with validation details returned

**Implementation Tasks**:

- [ ] T016 [US2] Add try-except wrapper around agent calls in /chat endpoint
- [ ] T017 [US2] Return structured ErrorResponse for Qdrant connection failures (500 status)
- [ ] T018 [US2] Return structured ErrorResponse for request validation failures (400 status with validation_details)
- [ ] T019 [P] [US2] Add error logging for debugging (import logging, log exceptions)
- [ ] T020 [US2] Test error scenarios: Qdrant timeout, malformed JSON, missing env vars

**Acceptance**: Qdrant connection failure returns 500 with clear error message. Malformed JSON returns 400 with validation details.

## Phase 5: Polish & Cross-Cutting

**Goal**: Production readiness and documentation

- [ ] T021 Create README.md for api.py with setup instructions (install deps, configure .env, run uvicorn)
- [ ] T022 [P] Add health check endpoint GET /health returning status 200
- [ ] T023 Update .env.example with all required variables (OPENROUTER_API_KEY, QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY, CORS_ORIGIN)
- [ ] T024 Document Docusaurus configuration in README (REACT_APP_API_URL environment variable)

## Parallel Execution Opportunities

**Phase 2**:
- T005 (Pydantic models) + T006 (import agent) + T007 (env loading) can run in parallel

**Phase 3 (US1)**:
- T013 (Docusaurus .env) can run in parallel with T008-T012 (backend implementation)

**Phase 4 (US2)**:
- T019 (logging) can run in parallel with T016-T018 (error handling)

**Phase 5**:
- T022 (health check) + T023 (.env.example) can run in parallel with T021 (README)

## Task Summary

**Total Tasks**: 24
**By Phase**:
- Setup: 3 tasks
- Foundational: 4 tasks
- US1 (P1): 8 tasks (MVP scope)
- US2 (P2): 5 tasks
- Polish: 4 tasks

**By User Story**:
- US1: 8 tasks (core functionality)
- US2: 5 tasks (error handling)
- Infrastructure: 11 tasks (setup + foundational + polish)

**Parallel Tasks**: 6 marked with [P]

**MVP Delivery**: Complete Phases 1-3 (15 tasks) for production-ready core functionality