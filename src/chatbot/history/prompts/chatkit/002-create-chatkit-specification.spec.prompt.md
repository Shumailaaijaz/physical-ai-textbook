---
id: 002
title: Create ChatKit Gemini RAG Chatbot Specification
stage: spec
date: 2025-12-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: chatkit-gemini-rag
branch: main
user: developer
command: /sp.specify
labels: ["specification", "chatkit", "gemini", "rag", "textbook-chatbot"]
links:
  spec: src/chatbot/specs/chatkit/spec.md
  ticket: null
  adr: src/chatbot/history/adr/001-chatbot-ui-integration-docusaurus.md
  pr: null
files:
  - src/chatbot/specs/chatkit/spec.md
  - src/chatbot/specs/chatkit/checklists/ (directory created)
tests:
  - Manual validation: All 16 checklist items passed
---

## Prompt

```text
/sp.specify Feature Specification: ChatKit Gemini Full-Stack Chat Application
Build a full-stack AI chat application using OpenAI's ChatKit framework with Google Gemini as the LLM backend

User Scenarios & Testing (mandatory)
 Chat with AI Assistant (Priority: P1)
Users can have real-time conversations with a Gemini-powered AI assistant through a modern chat interface.

Why this priority: Core functionality - without this, there is no product. Users need to send messages and receive AI responses.

Independent Test: Can be fully tested by opening the app, clicking the chat button, typing a message, and receiving a streamed AI response.

Acceptance Scenarios:

Given the app is loaded, When user clicks the chat button, Then a modal chat interface opens
Given the chat is open, When user types a message and sends it, Then the message appears in the chat history
Given a message was sent, When the AI responds, Then the response streams in real-time character by character
Given a conversation is ongoing, When user sends follow-up messages, Then the AI maintains conversation context

User Story 2 - Conversation Persistence (Priority: P2)
Users can return to their previous conversation when reopening the app.

Why this priority: Improves user experience by not losing conversation history on page refresh.

Independent Test: Can be tested by having a conversation, refreshing the page, and verifying the thread ID persists and conversation can continue.

Acceptance Scenarios:

Given a conversation is active, When user refreshes the page, Then the thread ID is preserved in localStorage
Given a thread ID exists in localStorage, When the app loads, Then the ChatKit component initializes with that thread
Given a user wants to start fresh, When they click "New Chat", Then localStorage is cleared and a new thread begins

User Story 3 - Suggested Prompts (Priority: P3)
New users see suggested prompts to help them get started with the chat.

Why this priority: Improves onboarding experience but not critical for core functionality.

Independent Test: Can be tested by opening a fresh chat (no history) and verifying three suggested prompts appear.

Acceptance Scenarios:

Given the chat modal opens with no history, When the start screen renders, Then three suggested prompt buttons appear
Given suggested prompts are visible, When user clicks one, Then that prompt is sent as a message

Edge Cases
What happens when the Gemini API key is missing or invalid? → Backend returns health check failure
How does system handle network disconnection during streaming? → Stream terminates, partial response shown
What happens when message IDs collide (Gemini/LiteLLM issue)? → Backend maps IDs to unique values
How does system handle very long conversations? → Items paginated with cursor support (100 items per page)

Requirements (mandatory)
Functional Requirements
FR-001: System MUST provide a floating chat button that opens a modal chat interface
FR-002: System MUST send user messages to a backend API endpoint via POST request
FR-003: System MUST stream AI responses using Server-Sent Events (SSE)
FR-004: System MUST maintain conversation context across multiple messages in a thread
FR-005: System MUST persist thread ID to browser localStorage for session continuity
FR-006: System MUST provide a "New Chat" button to reset the conversation
FR-007: System MUST handle Gemini/LiteLLM message ID collisions by remapping IDs
FR-008: System MUST provide health check endpoint for monitoring
FR-009: System MUST provide debug endpoint for inspecting thread state
FR-010: System MUST implement in-memory store for thread and message data

Key Entities
Thread: Represents a conversation session with unique ID, metadata, and creation timestamp
ThreadItem: Individual message in a conversation (user message or AI response) with content, role, and ID
Attachment: Optional file attachments associated with thread items (storage implemented but UI not exposed)

Success Criteria (mandatory)
Measurable Outcomes
SC-001: Users can send a message and receive a streamed response within 2 seconds of API call
```

User follow-up:
"forget this use my existing repo where book exists. where we working chatkit gemini i wrote mistakenly"

## Response snapshot

Created comprehensive feature specification for ChatKit Gemini RAG Chatbot at `src/chatbot/specs/chatkit/spec.md`:

**Specification Structure**:

1. **User Scenarios & Testing** (4 prioritized user stories):
   - US1 (P1): Ask Questions About Entire Textbook - Core RAG Q&A with citations
   - US2 (P1): Ask Questions About Selected Text Only - Focused comprehension mode
   - US3 (P2): Resume Previous Conversation - localStorage persistence
   - US4 (P3): Get Started with Suggested Prompts - Onboarding experience

2. **Functional Requirements** (36 requirements across 7 categories):
   - Chat Interface & Interaction (FR-001 to FR-005): FAB button, modal popup, ChatKit SDK integration
   - Message Handling & Streaming (FR-006 to FR-009): POST endpoint, SSE streaming, error handling
   - Conversation Context & Persistence (FR-010 to FR-013): Thread management, localStorage, history fetching
   - RAG Pipeline - General Mode (FR-014 to FR-018): Embedding, Qdrant search (top-k=5, threshold=0.7), Gemini generation, citation extraction
   - Selected-Text Mode (FR-019 to FR-024): Text selection API, constrained answers, mode indicators
   - Citation System (FR-025 to FR-028): Clickable links, navigation + scroll + highlight, relevance scores, tooltips
   - Backend API & Data Management (FR-029 to FR-033): Health check, debug endpoint, in-memory store, ID collision handling, logging
   - Onboarding & Suggested Prompts (FR-034 to FR-036): Start screen, prompt buttons

3. **Key Entities** (4 data structures):
   - **Thread**: Conversation session (thread_id, created_at, last_message_at, metadata)
   - **ThreadItem**: Individual message (item_id, thread_id, role, content, citations, metadata)
   - **Citation**: Textbook source reference (chunk_id, chapter, section, url, similarity_score, preview_text)
   - **TextbookChunk**: Pre-processed content (chunk_id, text, embedding, chapter, section, heading, source_file)

4. **Success Criteria** (15 measurable outcomes across 5 categories):
   - Performance & Responsiveness: 2-second response time, 500ms citation navigation, 300ms modal open
   - Accuracy & Relevance: 90% citation quality (>0.8 score), zero hallucinations, 100% selected-text constraint
   - User Experience & Adoption: 70% engagement rate, 50% citation clicks, 30% conversation resumption, 5+ message average
   - Reliability & Error Handling: 100% graceful edge case handling, 100ms health check, 95% thread persistence
   - Citation Quality: 95% correct navigation, 80% human-agreement on relevance scores

5. **Edge Cases** (7 scenarios):
   - Invalid API key → error banner
   - Network disconnection → partial response + retry
   - No relevant chunks (< 0.7) → polite refusal
   - Very long conversations (100+) → pagination
   - Off-topic questions → scope refusal
   - Selected text too long (>2000 words) → length warning
   - Inconsistent URL anchors → best-effort navigation + toast notification

6. **Additional Sections**:
   - **Assumptions** (10): Browser support, data pre-ingestion, API reliability, URL structure, ChatKit-Gemini compatibility
   - **Out of Scope** (11): Multi-user auth, chat export, voice I/O, image questions, multilingual UI, analytics dashboard, customizable personality, LMS integration, collaboration, attachments, feedback mechanism
   - **Dependencies**: Constitution compliance, ADR-001 UI pattern, Docusaurus infrastructure, external APIs (OpenAI embeddings, Gemini, Qdrant, Neon), browser APIs (Selection, localStorage, SSE)

**Specification Validation**:
- ✅ All 16 checklist items passed
- ✅ Zero [NEEDS CLARIFICATION] markers (informed guesses used appropriately)
- ✅ Constitution compliance verified: Aligns with Source Fidelity, RAG Transparency, Dual-Mode Interaction, Zero Hallucination, Citations principles
- ✅ ADR-001 compliance: FAB + Modal Popup UI pattern specified in FR-001 to FR-005
- ✅ Requirements testable and unambiguous (specific thresholds: top-k=5, threshold=0.7, 400 tokens, 100 overlap)
- ✅ Success criteria measurable and technology-agnostic (student-facing outcomes, not system internals)

**Key Design Decisions Captured**:
1. Dual-mode interaction (general textbook vs selected text) - FR-014 to FR-024
2. Citation system with clickable navigation + highlight animation - FR-025 to FR-028
3. RAG pipeline parameters (top-k=5, threshold=0.7, 400-token chunks, 100-token overlap) - FR-014 to FR-017
4. Selected-text length limit (10-2000 words) to prevent abuse - FR-024
5. Conversation persistence via localStorage (client) + in-memory store (backend) - FR-010 to FR-013
6. Health check + debug endpoints for monitoring - FR-029 to FR-030
7. ID collision handling for Gemini/LiteLLM compatibility - FR-032

## Outcome

- ✅ Impact: Comprehensive specification created for ChatKit Gemini RAG Chatbot, ready for planning phase
- 🧪 Tests: Validation checklist passed (16/16 items), no blocking issues found
- 📁 Files: 1 spec file created (`src/chatbot/specs/chatkit/spec.md`), 1 directory created (`checklists/`)
- 🔁 Next prompts:
  1. Run `/sp.plan` to create implementation plan with technical architecture
  2. Run `/sp.tasks` to generate actionable task breakdown
  3. Optional: Run `/sp.clarify` if any requirements need refinement (unlikely given comprehensive spec)
- 🧠 Reflection: Successfully expanded initial user input (which was already well-structured with 3 user stories, 10 FRs, 1 SC) into comprehensive spec with 4 user stories, 36 FRs, 15 SCs, 7 edge cases, 4 entities, assumptions, dependencies, and out-of-scope boundaries. Key insight: User provided excellent starting point - focus was on enriching with RAG-specific requirements (dual-mode interaction, citation system, vector search parameters) aligned with existing constitution principles.

## Evaluation notes (flywheel)

- Failure modes observed: None. Spec creation went smoothly with clear input requirements.
- Graders run and results (PASS/FAIL):
  - ✅ PASS: Specification completeness (all mandatory sections present)
  - ✅ PASS: Requirement testability (all FRs have clear pass/fail criteria)
  - ✅ PASS: Success criteria measurability (all SCs include specific metrics)
  - ✅ PASS: Technology-agnostic success criteria (focus on student outcomes, not system internals)
  - ✅ PASS: Constitution compliance (Source Fidelity, Zero Hallucination, Dual-Mode Interaction, Citations, RAG Transparency)
  - ✅ PASS: ADR-001 compliance (FAB + Modal Popup UI pattern specified)
- Prompt variant (if applicable): Standard `/sp.specify` command flow, no variations
- Next experiment (smallest change to try): Monitor planning phase for constitution-spec alignment - verify that FR-015 (top-k=5, threshold=0.7) translates to actual Qdrant query parameters in implementation plan. If discrepancies arise, consider adding "Technical Mapping" section to future specs that pre-maps key requirements to expected implementation parameters.

---

**Note**: This PHR captures the full specification creation flow including user's clarification about using existing chatbot directory (`src/chatbot`) instead of creating new feature branch. Spec was created directly in `src/chatbot/specs/chatkit/spec.md` to align with existing project structure where chatbot is a subproject of the main textbook repository.
