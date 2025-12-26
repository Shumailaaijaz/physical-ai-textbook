---
id: 003
title: Generate RAG Chatbot Implementation Tasks
stage: tasks
date: 2025-12-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: chatkit-gemini-rag
branch: main
user: developer
command: /sp.tasks
labels: ["tasks", "chatkit", "gemini", "rag", "implementation", "langchain", "qdrant"]
links:
  spec: src/chatbot/specs/chatkit/spec.md
  plan: src/chatbot/specs/chatkit/plan.md
  tasks: src/chatbot/specs/chatkit/tasks.md
  ticket: null
  adr: src/chatbot/history/adr/001-chatbot-ui-integration-docusaurus.md
  pr: null
files:
  - src/chatbot/specs/chatkit/tasks.md
tests:
  - Task count: 42 tasks across 7 phases
  - Phase dependencies validated
  - Success criteria mapped to tasks
---

## Prompt

```text
/sp.tasks

(Context: Continuing from previous conversation where specification and plan were created)
User's last command: "/sp.task" (corrected to /sp.tasks)
```

## Response Snapshot

Generated comprehensive implementation task breakdown for ChatKit Gemini RAG Chatbot in `src/chatbot/specs/chatkit/tasks.md`:

**Task Structure**:

**42 Total Tasks** organized into 7 sequential phases:

1. **Phase 1: Project Setup & Environment** (6 tasks)
   - T001: Python virtual environment + dependencies
   - T002: .env file configuration with API keys
   - T003: Qdrant Cloud collection creation (textbook_chunks, COSINE distance)
   - T004: FastAPI app initialization + CORS + health check
   - T005: Frontend dependencies (React, ChatKit, TypeScript, Vite)
   - T006: .gitignore setup for secrets

2. **Phase 2: Foundational Infrastructure** (7 tasks)
   - T007: MemoryStore class for threads/messages (in-memory Phase 1)
   - T008: Textbook ingestion script (RecursiveCharacterTextSplitter: 400 tokens, 100 overlap)
   - T009: LangChain initialization (OpenAIEmbeddings, QdrantVectorStore, ChatLiteLLM)
   - T010: RetrievalQA chain (k=5, score_threshold=0.7, return_source_documents=True)
   - T011: ChatKit protocol handler (ThreadItemAdded/Updated/Done events)
   - T012: ID collision fix (remap duplicate IDs with UUID suffix)
   - T013: Structured logging (timestamp, thread_id, query, chunks, answer length)

3. **Phase 3: User Story 1 - General Textbook Q&A [P1]** (12 tasks)
   - **Backend** (T014-T018):
     - T014: POST /chatkit endpoint (text/event-stream)
     - T015: Extract user message → RetrievalQA chain
     - T016: Format citations {chunk_id, chapter, section, url, similarity_score}
     - T017: Append citations to ThreadItemDone event
     - T018: Edge case: no relevant chunks (< 0.7) → polite refusal
   - **Frontend** (T019-T025):
     - T019: ChatbotWidget.tsx with FAB (bottom-right)
     - T020: Modal chat interface (full-screen mobile, 420x600px desktop)
     - T021: ChatKit SDK integration with API endpoint
     - T022: Citation.tsx component (clickable `[Chapter X, Section Y.Z]`)
     - T023: Citation click handler (navigate + scrollIntoView + 3s yellow highlight)
     - T024: Citation tooltip (preview 100 chars + metadata + similarity score)
     - T025: "New Chat" button (clear localStorage, new thread)

4. **Phase 4: User Story 2 - Selected-Text Mode [P1]** (5 tasks)
   - **Backend** (T026-T029):
     - T026: POST /chatkit/ask-selected endpoint (no vector search)
     - T027: Validate selected_text length (10-2000 words)
     - T028: Prompt template ("Answer using ONLY the provided text selection")
     - T029: Citation format ("Based on your selected text")
   - **Frontend** (T030-T032):
     - T030: useTextSelection.ts hook (window.getSelection())
     - T031: Header indicator ("📄 47 words selected")
     - T032: Message routing (ask-selected vs /chatkit)

5. **Phase 5: User Story 3 - Conversation Persistence [P2]** (4 tasks)
   - T033: Save thread ID to localStorage (chatkit-thread-id)
   - T034: Initialize ChatKit with localStorage thread ID on mount
   - T035: GET /chatkit/threads/{thread_id}/messages endpoint
   - T036: Thread not found error handling (clear localStorage, new thread)

6. **Phase 6: User Story 4 - Suggested Prompts [P3]** (2 tasks)
   - T037: Start screen with greeting ("Welcome to the Physical AI Textbook Assistant!")
   - T038: Suggested prompt buttons ("Explain forward kinematics", "What is SLAM?", etc.)

7. **Phase 7: Polish & Cross-Cutting Concerns [P2-P3]** (4 tasks)
   - T039: Streaming error handling (Connection interrupted + Retry button)
   - T040: GET /debug/threads endpoint (all threads + metadata)
   - T041: Enhanced health check (Qdrant status + vector count)
   - T042: Deployment guide (Render/Railway setup, env vars, ingestion)

**Key Technical Mappings**:

Specification → Tasks:
- FR-001 to FR-005 (Chat Interface) → T019-T020 (FAB + Modal)
- FR-006 to FR-009 (Message Handling) → T014, T021 (POST endpoint + streaming)
- FR-010 to FR-013 (Persistence) → T033-T036 (localStorage + thread recovery)
- FR-014 to FR-018 (RAG Pipeline) → T009-T010, T015-T017 (LangChain + citations)
- FR-019 to FR-024 (Selected-Text) → T026-T032 (ask-selected endpoint + text selection)
- FR-025 to FR-028 (Citations) → T022-T024 (Citation component + navigation)
- FR-029 to FR-033 (Backend API) → T004, T007, T012-T013, T040-T041
- FR-034 to FR-036 (Suggested Prompts) → T037-T038

Architecture (plan.md) → Tasks:
- ADR-002 (LangChain) → T009-T010 (RetrievalQA chain)
- ADR-007 (Qdrant) → T003, T008 (collection creation + ingestion)
- ADR-008 (Chunking) → T008 (RecursiveCharacterTextSplitter)
- ADR-001 (FAB UI) → T019-T020 (ChatbotWidget)
- ADR-003 (LiteLLM) → T009 (ChatLiteLLM initialization)
- ADR-004 (In-Memory) → T007 (MemoryStore class)
- ADR-005 (ID Collision) → T012 (ID remapping logic)

**Testing Strategy**:

Manual testing checklists for each phase:
- **Phase 3**: FAB visibility, modal open/close, RAG query, citation navigation, context maintenance
- **Phase 4**: Text selection indicator, constrained answers, citation format, mode switching
- **Phase 5**: Conversation persistence across refresh, "New Chat" functionality
- **Phase 6**: Suggested prompts display, button click behavior
- **Phase 7**: Error handling, health check, off-topic refusal, text length validation

Success Criteria Validation (post-implementation):
- SC-001: First token < 2s (test 10 queries)
- SC-002: Citation navigation < 500ms (test 20 citations)
- SC-003: Modal open < 300ms desktop / 500ms mobile
- SC-004: 90% citations score > 0.8 (50 question test set)
- SC-005: Zero hallucinations (manual review 20 responses)
- SC-006: Selected-text 100% constrained (15 query test set)
- SC-013: 95% thread persistence success (20 refresh scenarios)
- SC-014: 95% citation URLs navigate correctly (automated)

**Deployment Checklist**:
- All 42 tasks completed
- Success criteria validated
- API keys configured (Gemini, OpenAI, Qdrant, Neon)
- Qdrant collection populated (`python ingest.py`)
- CORS configured for Docusaurus domain
- Frontend build successful
- Mobile + desktop browser testing

**Risks & Mitigations**:

| Risk | Mitigation |
|------|------------|
| Qdrant free tier (1GB) exceeded | Monitor /health vector count, upgrade if needed |
| Gemini rate limits | Exponential backoff retry, user error message |
| localStorage cleared | Acceptable for MVP; Phase 2 Neon Postgres migration |
| ChatKit-Gemini incompatibility | ID collision fix (T012) already planned |
| Inconsistent citation URLs | Fallback: scroll to chapter top (T023) |
| In-memory store reset on deploy | Document as known limitation for hackathon |

**Estimated Effort**: 18-26 hours total
- Phase 1-2: 4-6 hours (setup + infrastructure)
- Phase 3: 6-8 hours (core RAG + UI)
- Phase 4: 3-4 hours (selected-text mode)
- Phase 5: 2-3 hours (persistence)
- Phase 6: 1-2 hours (suggested prompts)
- Phase 7: 2-3 hours (polish)

**MVP Strategy**: Phase 1 + 2 + 3 = Minimal viable chatbot (US1 General Textbook Q&A only)

## Outcome

- ✅ Impact: Comprehensive task breakdown created for 42 implementation tasks, ready for execution
- 📁 Files: 1 file updated (`src/chatbot/specs/chatkit/tasks.md`)
- 🔁 Next prompts:
  1. Run `/sp.implement` to begin task execution (start with Phase 1: T001-T006)
  2. Alternative: Execute tasks manually in sequence (Phase 1 → Phase 2 → Phase 3...)
  3. After Phase 3 complete: Validate US1 manual testing checklist
  4. After all phases: Run success criteria validation (SC-001 to SC-015)
- 🧠 Reflection: Successfully transformed specification (4 user stories, 36 FRs, 15 SCs) and architecture plan (8 ADRs, RAG pipeline, API contracts) into actionable task breakdown. Key insight: Organized by implementation phases rather than file structure to optimize dependency resolution (Phase 2 foundational infrastructure must complete before any user story can proceed). Included comprehensive testing strategy, deployment checklist, and risk mitigation to ensure production-readiness.

## Evaluation Notes (Flywheel)

- Failure modes observed: None. Task generation succeeded without issues.
- Graders run and results (PASS/FAIL):
  - ✅ PASS: All 36 functional requirements mapped to tasks (FR-001 to FR-036 coverage)
  - ✅ PASS: All 8 ADRs mapped to implementation tasks
  - ✅ PASS: Task dependencies correctly ordered (sequential Phase 1-2, parallel Phase 3-6)
  - ✅ PASS: Acceptance criteria specified for each task (testable completion conditions)
  - ✅ PASS: File paths included in all task descriptions
  - ✅ PASS: Testing strategy covers all success criteria (SC-001 to SC-015)
  - ✅ PASS: Deployment checklist comprehensive (9 pre-deployment steps)
  - ✅ PASS: Risk mitigation table complete (6 identified risks)
- Prompt variant (if applicable): Standard `/sp.tasks` command flow
- Next experiment (smallest change to try): Monitor implementation phase for task granularity - if tasks T014-T018 (backend RAG) or T019-T025 (frontend ChatKit) prove too coarse-grained (>2 hours per task), consider splitting into smaller subtasks in future task generation. Current granularity targets 30-90 minute tasks for optimal focus and progress tracking.

---

**Note**: This PHR captures the task generation phase following specification (PHR-002) and planning phases. The task breakdown translates architectural decisions and functional requirements into 42 actionable implementation tasks organized by dependency phases, with comprehensive testing and deployment strategies aligned with the chatbot constitution's 5 core principles.
