# Implementation Tasks: ChatKit Gemini RAG Chatbot

**Feature Branch**: `main` (chatbot subproject) | **Created**: 2025-12-10 | **Status**: Ready for Implementation

**Input**: Specification from [spec.md](./spec.md), Architecture from [plan.md](./plan.md)

## Task Organization

Tasks are organized by implementation phases, aligned with user stories (US1-US4) and priorities (P1-P3).

**Task Format**: `- [ ] T### [Priority] [Story] Task description in file.py or Component.tsx`

**Dependency Strategy**:
- **Phase 1-2**: Sequential (setup → infrastructure)
- **Phase 3-6**: Can run in parallel after Phase 2 completes
- **Phase 7**: Final polish after all features

**MVP Strategy**: Phase 1 + 2 + 3 = Minimal viable chatbot (US1 only)

---

## Phase 1: Project Setup & Environment (6 tasks)

**Goal**: Configure development environment, install dependencies, validate API keys

**Dependencies**: None (start here)

- [ ] T001 [P1] [Setup] Create Python virtual environment in `backend/` and install dependencies from requirements.txt
  - File: `backend/env/` (directory)
  - Acceptance: `python --version` shows 3.11+, `pip list` shows fastapi, langchain, qdrant-client, openai-chatkit

- [ ] T002 [P1] [Setup] Create `.env` file in `backend/` with all required API keys from `.env.example`
  - File: `backend/.env`
  - Acceptance: File contains GEMINI_API_KEY, OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY, PORT, LOG_LEVEL

- [ ] T003 [P1] [Setup] Create Qdrant Cloud collection `textbook_chunks` with vector config (size=1536, distance=COSINE)
  - File: `backend/setup_qdrant.py` (one-time script)
  - Acceptance: Qdrant dashboard shows collection with correct vector params, 0 vectors initially

- [ ] T004 [P1] [Setup] Initialize FastAPI app structure with CORS middleware and health check endpoint
  - File: `backend/main.py`
  - Acceptance: `uvicorn main:app --reload` starts server, `curl localhost:8000/health` returns JSON

- [ ] T005 [P1] [Setup] Install frontend dependencies (React, ChatKit, TypeScript) and configure Vite
  - File: `frontend/package.json`, `frontend/vite.config.ts`
  - Acceptance: `npm install` succeeds, `npm run dev` starts dev server on port 3000

- [ ] T006 [P1] [Setup] Add `backend/.env` and `backend/env/` to `.gitignore` to prevent committing secrets
  - File: `.gitignore`
  - Acceptance: `git status` does not show .env or env/ as untracked files

---

## Phase 2: Foundational Infrastructure (7 tasks)

**Goal**: Build core RAG pipeline, memory store, and ChatKit integration

**Dependencies**: Phase 1 complete

- [ ] T007 [P1] [Infra] Implement in-memory MemoryStore class for threads/messages with `create_thread()`, `add_message()`, `get_thread()` methods
  - File: `backend/main.py` (MemoryStore class)
  - Acceptance: Can create thread, add 10 messages, retrieve by thread_id

- [ ] T008 [P1] [Infra] Implement textbook ingestion script to load Docusaurus .md files, chunk with RecursiveCharacterTextSplitter (400 tokens, 100 overlap), and upload to Qdrant
  - File: `backend/ingest.py`
  - Acceptance: `python ingest.py` processes `docs/` folder, uploads chunks to Qdrant with metadata (chapter, section, source_file)

- [ ] T009 [P1] [Infra] Initialize LangChain components: OpenAIEmbeddings (text-embedding-3-small), QdrantVectorStore, ChatLiteLLM (gemini-2.0-flash)
  - File: `backend/main.py` (global initialization)
  - Acceptance: embeddings.embed_query("test") returns 1536-dim vector, llm.invoke("test") returns response

- [ ] T010 [P1] [Infra] Create LangChain RetrievalQA chain with vector store retriever (k=5, score_threshold=0.7) and return_source_documents=True
  - File: `backend/main.py` (qa_chain initialization)
  - Acceptance: qa_chain({"query": "What is kinematics?"}) returns answer + source_documents list

- [ ] T011 [P1] [Infra] Implement ChatKit protocol handler with `respond()` async generator yielding ThreadItemAdded, ThreadItemUpdated, ThreadItemDone events
  - File: `backend/main.py` (respond function)
  - Acceptance: Calling respond() yields SSE events with incremental content updates

- [ ] T012 [P1] [Infra] Add ID collision fix: remap duplicate message IDs by appending `-{uuid}` suffix in respond() event stream
  - File: `backend/main.py` (respond function, ID remapping logic)
  - Acceptance: Sending 2 messages with same ID results in different IDs in MemoryStore

- [ ] T013 [P1] [Infra] Implement structured logging with timestamp, thread_id, query, top-3 chunk IDs, answer length for all RAG queries
  - File: `backend/main.py` (logging setup)
  - Acceptance: Console shows log entry with all fields for each query

---

## Phase 3: User Story 1 - General Textbook Q&A (12 tasks)

**Goal**: RAG-powered chat with citations and navigation

**Priority**: P1 (Core feature)

**Dependencies**: Phase 2 complete

### Backend RAG Endpoint

- [ ] T014 [P1] [US1] Create POST /chatkit endpoint accepting {thread_id, items} payload and returning text/event-stream response
  - File: `backend/main.py` (chatkit route)
  - Acceptance: POST request with thread_id triggers RAG pipeline and streams events

- [ ] T015 [P1] [US1] Extract last user message from items array and pass to RetrievalQA chain
  - File: `backend/main.py` (chatkit route handler)
  - Acceptance: User message "What is SLAM?" triggers Qdrant search for "SLAM" query

- [ ] T016 [P1] [US1] Extract source documents from RetrievalQA result and format citations as {chunk_id, chapter, section, url, similarity_score}
  - File: `backend/main.py` (citation extraction logic)
  - Acceptance: Result includes citations array with chapter 5, section "1.2", url "/docs/chapter-5/slam#intro", score 0.92

- [ ] T017 [P1] [US1] Append citations to ThreadItemDone event metadata with format `[Chapter X, Section Y.Z]`
  - File: `backend/main.py` (respond function, citation formatting)
  - Acceptance: Final event includes citations: [{chapter: 3, section: "2.1", url: "...", score: 0.89}]

- [ ] T018 [P1] [US1] Handle edge case: no relevant chunks (all scores < 0.7) → return polite refusal message
  - File: `backend/main.py` (RAG edge case handling)
  - Acceptance: Query "What is the weather?" returns "I cannot find relevant information in the textbook..."

### Frontend ChatKit Integration

- [ ] T019 [P1] [US1] Create ChatbotWidget.tsx component with floating action button (FAB) in bottom-right corner
  - File: `frontend/src/components/ChatbotWidget.tsx`
  - Acceptance: FAB button visible in bottom-right, styled with Docusaurus theme colors

- [ ] T020 [P1] [US1] Implement modal chat interface that opens on FAB click, full-screen on mobile (<768px), 420x600px popup on desktop
  - File: `frontend/src/components/ChatbotWidget.tsx` (modal logic)
  - Acceptance: Click FAB → modal opens, backdrop closes modal on click, ESC key closes modal

- [ ] T021 [P1] [US1] Integrate ChatKit React SDK with API endpoint `process.env.REACT_APP_API_URL/chatkit` and dark theme config
  - File: `frontend/src/components/ChatbotWidget.tsx` (ChatKit configuration)
  - Acceptance: Typing message in ChatKit UI sends POST to backend and displays streamed response

- [ ] T022 [P1] [US1] Create Citation.tsx component rendering citations as clickable links with format `[Chapter X, Section Y.Z]`
  - File: `frontend/src/components/Citation.tsx`
  - Acceptance: Citations appear as blue hyperlinks in AI responses

- [ ] T023 [P1] [US1] Implement citation click handler: navigate to URL + scrollIntoView + 3-second yellow highlight animation
  - File: `frontend/src/components/Citation.tsx` (onClick handler)
  - Acceptance: Clicking "[Chapter 3, Section 2.1]" navigates to /docs/chapter-3/kinematics#forward-kinematics, scrolls to section, highlights yellow for 3 seconds

- [ ] T024 [P1] [US1] Add citation tooltip on hover showing first 100 characters of source chunk + metadata (chapter, section, similarity score)
  - File: `frontend/src/components/Citation.tsx` (tooltip component)
  - Acceptance: Hovering over citation shows tooltip with preview text and metadata

- [ ] T025 [P1] [US1] Add "New Chat" button in chat header that clears localStorage thread ID and reinitializes ChatKit with new thread
  - File: `frontend/src/components/ChatbotWidget.tsx` (header actions)
  - Acceptance: Click "New Chat" → localStorage cleared, chat displays start screen with suggested prompts

---

## Phase 4: User Story 2 - Selected-Text Mode (5 tasks)

**Goal**: Constrained Q&A using only highlighted text

**Priority**: P1 (Core feature)

**Dependencies**: Phase 3 complete (uses same ChatKit UI)

### Backend Selected-Text Endpoint

- [ ] T026 [P1] [US2] Create POST /chatkit/ask-selected endpoint accepting {thread_id, query, selected_text, items} payload
  - File: `backend/main.py` (ask-selected route)
  - Acceptance: POST with selected_text bypasses Qdrant search and sends text directly to Gemini

- [ ] T027 [P1] [US2] Validate selected_text length: 10-2000 words, return error if out of range
  - File: `backend/main.py` (validation logic)
  - Acceptance: Sending 5 words returns error "Selected text too short", 2500 words returns "Selected text too long"

- [ ] T028 [P1] [US2] Construct prompt with system instruction "Answer using ONLY the provided text selection" + selected_text + query
  - File: `backend/main.py` (selected-text prompt template)
  - Acceptance: LLM receives prompt with selected text as context, no retrieval chunks

- [ ] T029 [P1] [US2] Return citation as `{"text": "Based on your selected text"}` instead of chapter references
  - File: `backend/main.py` (selected-text citation formatting)
  - Acceptance: Response includes citation with text "Based on your selected text", no clickable URL

### Frontend Text Selection

- [ ] T030 [P1] [US2] Create useTextSelection.ts hook detecting text selection on page using window.getSelection() API
  - File: `frontend/src/hooks/useTextSelection.ts`
  - Acceptance: Highlighting text on textbook page triggers hook, returns selected text string

- [ ] T031 [P1] [US2] Display selected-text indicator in chat header "📄 47 words selected" when text is highlighted
  - File: `frontend/src/components/ChatbotWidget.tsx` (header indicator)
  - Acceptance: Selecting 47 words shows indicator, clearing selection removes indicator

- [ ] T032 [P1] [US2] Route messages to /chatkit/ask-selected endpoint when selected_text exists, else route to /chatkit
  - File: `frontend/src/components/ChatbotWidget.tsx` (message routing logic)
  - Acceptance: With selection active, sending message calls ask-selected endpoint; without selection, calls /chatkit

---

## Phase 5: User Story 3 - Conversation Persistence (4 tasks)

**Goal**: Resume previous conversations across page refreshes

**Priority**: P2 (Enhanced UX)

**Dependencies**: Phase 3 complete (needs ChatKit integration)

- [ ] T033 [P2] [US3] Save thread ID to localStorage (key: `chatkit-thread-id`) when ChatKit creates or updates thread
  - File: `frontend/src/components/ChatbotWidget.tsx` (localStorage integration)
  - Acceptance: After sending message, localStorage.getItem('chatkit-thread-id') returns thread ID

- [ ] T034 [P2] [US3] Initialize ChatKit with thread ID from localStorage on component mount
  - File: `frontend/src/components/ChatbotWidget.tsx` (useEffect initialization)
  - Acceptance: Refresh page → ChatKit loads with existing thread ID, messages visible

- [ ] T035 [P2] [US3] Implement GET /chatkit/threads/{thread_id}/messages endpoint returning message history from MemoryStore
  - File: `backend/main.py` (message history route)
  - Acceptance: GET request with valid thread_id returns array of messages with roles, content, citations

- [ ] T036 [P2] [US3] Handle thread not found error: if localStorage thread_id doesn't exist in backend, clear localStorage and create new thread
  - File: `frontend/src/components/ChatbotWidget.tsx` (error handling)
  - Acceptance: localStorage has invalid thread_id → error caught, localStorage cleared, new thread created

---

## Phase 6: User Story 4 - Suggested Prompts (2 tasks)

**Goal**: Onboarding experience for new users

**Priority**: P3 (Nice-to-have)

**Dependencies**: Phase 3 complete (needs ChatKit UI)

- [ ] T037 [P3] [US4] Display start screen with greeting "Welcome to the Physical AI Textbook Assistant!" when no conversation history
  - File: `frontend/src/components/ChatbotWidget.tsx` (start screen component)
  - Acceptance: Opening chat with no thread ID shows greeting message

- [ ] T038 [P3] [US4] Render 3-5 suggested prompt buttons ("Explain forward kinematics", "What is SLAM?", "How do sensors work?", "Tell me about ROS 2")
  - File: `frontend/src/components/ChatbotWidget.tsx` (suggested prompts)
  - Acceptance: Start screen shows 4 clickable prompt buttons, clicking sends prompt as user message

---

## Phase 7: Polish & Cross-Cutting Concerns (4 tasks)

**Goal**: Error handling, monitoring, documentation

**Priority**: P2-P3 (Quality assurance)

**Dependencies**: All features complete

- [ ] T039 [P2] [Polish] Implement streaming error handling: if SSE disconnects, show partial response with "(Connection interrupted)" and "Retry" button
  - File: `frontend/src/components/ChatbotWidget.tsx` (error boundary)
  - Acceptance: Killing backend mid-stream shows partial response + retry button, clicking retry re-sends message

- [ ] T040 [P2] [Polish] Add GET /debug/threads endpoint returning all threads with message counts, timestamps, metadata
  - File: `backend/main.py` (debug route)
  - Acceptance: GET /debug/threads returns JSON with all thread IDs, message counts, created_at timestamps

- [ ] T041 [P3] [Polish] Update health check endpoint to include Qdrant status, collection name, vector count
  - File: `backend/main.py` (enhanced health check)
  - Acceptance: GET /health returns {status: "ok", model: "gemini-2.0-flash", qdrant_status: "connected", qdrant_vectors: 15432}

- [ ] T042 [P3] [Polish] Create deployment guide documenting Render/Railway setup, environment variables, Qdrant ingestion steps
  - File: `src/chatbot/README.md` (deployment section)
  - Acceptance: README includes step-by-step deployment instructions with commands and screenshots

---

## Testing Strategy

**Manual Testing Checklist** (run after each phase):

**Phase 3 (US1)**:
- [ ] Open textbook → FAB button visible bottom-right
- [ ] Click FAB → modal opens (420x600px desktop, full-screen mobile)
- [ ] Type "What is forward kinematics?" → AI responds with citations
- [ ] Click citation `[Chapter 3, Section 2.1]` → navigates to section, highlights yellow for 3 seconds
- [ ] Send follow-up "Can you give an example?" → AI maintains context

**Phase 4 (US2)**:
- [ ] Highlight 200-word paragraph → chat header shows "📄 47 words selected"
- [ ] Ask "Summarize this" → response constrained to selected text only
- [ ] Citation shows "Based on your selected text" (not clickable)
- [ ] Clear selection → header indicator disappears, next message uses general RAG

**Phase 5 (US3)**:
- [ ] Have 10-message conversation → refresh page → chat loads with full history
- [ ] Click "New Chat" → localStorage cleared, start screen appears

**Phase 6 (US4)**:
- [ ] Clear localStorage → open chat → 4 suggested prompts visible
- [ ] Click "What is SLAM?" → prompt sent as message, AI responds

**Phase 7 (Polish)**:
- [ ] Kill backend mid-stream → "(Connection interrupted)" shown + retry button
- [ ] GET /health → returns {status: "ok", qdrant_vectors: 15432}
- [ ] Ask off-topic "What is the weather?" → refusal message
- [ ] Select 2500 words → error "Selected text too long"

---

## Success Criteria Validation

After all tasks complete, validate against [spec.md](./spec.md) Success Criteria:

- **SC-001**: First token within 2 seconds (test 10 queries, measure time)
- **SC-002**: Citation navigation within 500ms (test 20 citations)
- **SC-003**: Modal opens within 300ms desktop / 500ms mobile
- **SC-004**: 90% of questions have citation score > 0.8 (test set of 50 questions)
- **SC-005**: Zero hallucinations (manual review of 20 responses)
- **SC-006**: Selected-text mode 100% constrained (test set of 15 queries)
- **SC-013**: 95% thread persistence success (test 20 refresh scenarios)
- **SC-014**: 95% citation URLs navigate correctly (automated test)

---

## Deployment Checklist

Before deploying to production:

- [ ] All Phase 1-7 tasks completed
- [ ] Success criteria SC-001 to SC-006, SC-013, SC-014 validated
- [ ] API keys set in Render/Railway environment variables
- [ ] Qdrant collection populated with textbook chunks (`python ingest.py`)
- [ ] CORS configured to allow Docusaurus domain
- [ ] Health check endpoint returns status: "ok"
- [ ] Frontend build succeeds (`npm run build`)
- [ ] Docusaurus theme swizzled to inject ChatbotWidget globally
- [ ] Test on mobile (iOS Safari, Android Chrome) and desktop (Chrome, Firefox, Safari)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Qdrant free tier limit (1GB) exceeded | Cannot add more chunks | Monitor vector count in /health endpoint, upgrade to paid tier if needed |
| Gemini API rate limit hit | Requests fail | Implement exponential backoff retry, display "Please try again" message |
| localStorage cleared by browser | Conversation history lost | Acceptable for MVP; Phase 2 migrate to Neon Postgres |
| ChatKit incompatible with Gemini | Streaming breaks | ID collision fix (T012) already implemented; test with Gemini 2.0 Flash |
| Citation URLs inconsistent | Navigation fails | Fallback: scroll to chapter top if section anchor missing (T023) |
| In-memory store reset on deploy | All threads lost | Acceptable for hackathon; document in README as known limitation |

---

## Next Steps

1. **Verify Setup**: Ensure all API keys obtained (Gemini, OpenAI, Qdrant)
2. **Start Implementation**: Begin with Phase 1 tasks (T001-T006)
3. **Incremental Testing**: Test after each phase completes
4. **Create PHR**: Document this task generation process
5. **Deploy**: Follow deployment checklist after Phase 7 complete

**Estimated Effort**:
- Phase 1-2: 4-6 hours (setup + infrastructure)
- Phase 3: 6-8 hours (core RAG + UI)
- Phase 4: 3-4 hours (selected-text mode)
- Phase 5: 2-3 hours (persistence)
- Phase 6: 1-2 hours (suggested prompts)
- Phase 7: 2-3 hours (polish)

**Total**: 18-26 hours for complete implementation
