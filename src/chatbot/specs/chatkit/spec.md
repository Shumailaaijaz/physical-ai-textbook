# Feature Specification: ChatKit Gemini RAG Chatbot for Textbook

**Feature Branch**: `main` (chatbot subproject)
**Created**: 2025-12-09
**Status**: Draft
**Input**: Build a full-stack AI chat application using OpenAI's ChatKit framework with Google Gemini as the LLM backend, integrated into the Physical AI & Humanoid Robotics textbook for RAG-powered Q&A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask Questions About Entire Textbook (Priority: P1)

Students can ask questions about any topic in the Physical AI & Humanoid Robotics textbook and receive answers grounded in the textbook content with citations.

**Why this priority**: Core functionality - without this, the chatbot provides no value. Students need AI-assisted learning that references the exact textbook material they're studying.

**Independent Test**: Can be fully tested by opening the textbook, clicking the chat button, asking "What is forward kinematics?", and receiving a streamed response with clickable citations to textbook chapters.

**Acceptance Scenarios**:

1. **Given** the textbook page is loaded, **When** student clicks the floating chat button, **Then** a modal chat interface opens with greeting and suggested prompts
2. **Given** the chat is open, **When** student types "Explain inverse kinematics" and sends, **Then** the message appears in chat history immediately
3. **Given** a message was sent, **When** the AI processes the query, **Then** relevant textbook chunks are retrieved from vector database (Qdrant) and the response streams in real-time character by character
4. **Given** the AI generates an answer, **When** the response completes, **Then** citations appear as clickable links (e.g., "[Chapter 3, Section 2.1]") that navigate to exact textbook sections
5. **Given** a conversation is ongoing, **When** student sends follow-up message "Can you give an example?", **Then** the AI maintains context from previous messages in the thread

---

### User Story 2 - Ask Questions About Selected Text Only (Priority: P1)

Students can highlight specific textbook passages and ask questions that will be answered using ONLY the selected text, without retrieving other content.

**Why this priority**: Essential for focused comprehension. Students studying a specific paragraph need answers constrained to that context, not diluted with information from other chapters.

**Independent Test**: Can be tested by highlighting a paragraph about "Denavit-Hartenberg parameters", clicking "Ask about selection", typing "Summarize this", and verifying the answer references only the highlighted text.

**Acceptance Scenarios**:

1. **Given** the student is reading Chapter 3, **When** they highlight a 200-word paragraph about D-H parameters, **Then** the text selection is captured by the chatbot widget
2. **Given** text is selected, **When** student opens chat and types a question, **Then** the chat header displays "📄 Asking about: 47 words selected" (or similar indicator)
3. **Given** selected-text mode is active, **When** student asks "What does this mean?", **Then** the backend receives the question + selected text (NO vector search performed)
4. **Given** the AI generates an answer, **When** response completes, **Then** citation shows "Based on your selected text" (not chapter references)
5. **Given** student wants to switch modes, **When** they clear selection or click "Ask about entire textbook", **Then** chat returns to general RAG mode

---

### User Story 3 - Resume Previous Conversation (Priority: P2)

Students can close the chatbot, refresh the page, or return tomorrow and continue their previous conversation without losing history.

**Why this priority**: Improves learning continuity. Students often study across multiple sessions and need to reference previous Q&A exchanges.

**Independent Test**: Can be tested by having a 5-message conversation, closing the browser, reopening the textbook site, and verifying the same conversation thread loads with full history visible.

**Acceptance Scenarios**:

1. **Given** a conversation has 10 messages (5 questions + 5 AI answers), **When** student refreshes the page, **Then** the thread ID is retrieved from localStorage and the conversation history loads
2. **Given** thread ID exists in localStorage, **When** the ChatKit component initializes, **Then** it fetches message history from backend in-memory store
3. **Given** student wants to start fresh, **When** they click "New Chat" button, **Then** localStorage thread ID is cleared, a new thread is created, and the chat displays empty with suggested prompts

---

### User Story 4 - Get Started with Suggested Prompts (Priority: P3)

New students opening the chatbot for the first time see 3-5 suggested prompts to help them understand what questions they can ask.

**Why this priority**: Improves onboarding experience and helps students discover chatbot capabilities, but not critical for core functionality.

**Independent Test**: Can be tested by clearing localStorage (simulating first-time user), opening chat, and verifying suggested prompts like "Explain forward kinematics", "What is ROS 2?", "Help me understand sensors" appear as clickable buttons.

**Acceptance Scenarios**:

1. **Given** the chat modal opens with no conversation history, **When** the start screen renders, **Then** three suggested prompt buttons appear below the greeting
2. **Given** suggested prompts are visible ("Explain actuators", "What is SLAM?", "How do humanoid robots walk?"), **When** student clicks "What is SLAM?", **Then** that prompt is sent as a message and the AI responds with a SLAM explanation + citations

---

### Edge Cases

- **What happens when the Gemini API key is missing or invalid?** → Backend `/health` endpoint returns `{"status": "error", "message": "Gemini API key not configured"}`, frontend displays error banner: "Chatbot unavailable - please contact administrator"
- **How does system handle network disconnection during streaming?** → Stream terminates mid-response, partial answer shown with indicator "(Connection interrupted)", student can click "Retry" to re-send question
- **What happens when no relevant textbook chunks found (similarity < 0.7 threshold)?** → Backend returns `{"answer": "I cannot find relevant information in the textbook to answer this question. Please try rephrasing or check the textbook chapters.", "citations": []}`
- **How does system handle very long conversations (100+ messages)?** → Backend implements pagination: returns last 100 messages by default, older messages accessible via "Load earlier messages" button (cursor-based pagination)
- **What happens when student asks off-topic question ("What is the weather?")** → RAG retrieval returns no chunks above threshold, AI refuses with: "This question is outside the textbook's scope. I can only answer questions about Physical AI and Humanoid Robotics content."
- **What happens when selected text is too long (>2000 words)?** → Frontend displays warning: "Selected text too long (2,134 words). Please select a shorter passage (max 2,000 words)." Send button disabled until selection reduced.
- **How does citation navigation work if textbook uses URL anchors inconsistently?** → Backend returns best-effort URL (`/docs/chapter-3/kinematics#section-2-1`), frontend attempts scroll with `scrollIntoView()`, falls back to scrolling to chapter top if anchor missing, displays toast: "Navigated to Chapter 3 (exact section not found)"

---

## Requirements *(mandatory)*

### Functional Requirements

**Chat Interface & Interaction**:
- **FR-001**: System MUST provide a floating action button (FAB) in bottom-right corner of every textbook page that opens a modal chat interface when clicked
- **FR-002**: System MUST display chat modal as full-screen overlay on mobile (<768px) and as 420x600px popup on desktop, with semi-transparent backdrop that closes modal when clicked
- **FR-003**: System MUST render chat interface using OpenAI ChatKit React SDK with dark theme matching Docusaurus color scheme (grayscale hue: 220, accent color: #4cc9f0)
- **FR-004**: System MUST provide "New Chat" button in chat header that clears localStorage thread ID and creates new conversation thread
- **FR-005**: System MUST provide close button (X) in chat header that minimizes modal back to FAB without destroying conversation state

**Message Handling & Streaming**:
- **FR-006**: System MUST send user messages to backend FastAPI endpoint `POST /chatkit/threads/{thread_id}/messages` with message content and thread ID
- **FR-007**: System MUST stream AI responses using Server-Sent Events (SSE) or ChatKit streaming protocol, rendering tokens character-by-character as received
- **FR-008**: System MUST display user messages immediately upon send (optimistic UI update), showing loading indicator until AI response begins
- **FR-009**: System MUST handle streaming errors gracefully: if stream disconnects, show partial response with "(Connection interrupted)" indicator and "Retry" button

**Conversation Context & Persistence**:
- **FR-010**: System MUST maintain conversation context across multiple messages within a thread by passing full message history to backend RAG pipeline (last 10 messages for context window)
- **FR-011**: System MUST persist thread ID to browser localStorage (key: `chatkit-thread-id`) when thread is created or updated
- **FR-012**: System MUST initialize ChatKit component with thread ID from localStorage on page load, fetching message history from backend
- **FR-013**: System MUST handle thread not found errors (localStorage references deleted thread): clear localStorage and create new thread

**RAG Pipeline (General Mode)**:
- **FR-014**: System MUST embed user query using OpenAI `text-embedding-3-small` model before vector search
- **FR-015**: System MUST perform vector similarity search in Qdrant collection `textbook_chunks` with parameters: top-k=5, similarity threshold=0.7, distance metric=COSINE
- **FR-016**: System MUST construct prompt with system instructions ("Answer ONLY using textbook context, include citations"), retrieved chunks (top-5), and user question
- **FR-017**: System MUST generate answer using Google Gemini model (via LiteLLM) with parameters: temperature=0.2, max_tokens=500, streaming=true
- **FR-018**: System MUST extract citations from retrieved chunks metadata and format as `[Chapter X, Section Y.Z]` inline after relevant sentences

**Selected-Text Mode**:
- **FR-019**: System MUST detect text selection on textbook pages using JavaScript Selection API (`window.getSelection()`)
- **FR-020**: System MUST display selected-text indicator in chat header when text is highlighted (e.g., "📄 47 words selected")
- **FR-021**: System MUST send selected-text queries to separate endpoint `POST /chatkit/ask-selected` with `{query, selected_text}` payload (NO vector search)
- **FR-022**: System MUST constrain Gemini answer to selected text only (system prompt: "Answer using ONLY the provided text selection. Do not use external knowledge.")
- **FR-023**: System MUST display citation "Based on your selected text" for selected-text mode answers (no chapter references)
- **FR-024**: System MUST enforce selected-text length limit: 10-2000 words. Display error if exceeded: "Selected text too long/short"

**Citation System**:
- **FR-025**: System MUST render citations as clickable hyperlinks with format `[Chapter X, Section Y.Z]` or `[Page N]`
- **FR-026**: System MUST navigate to cited textbook section when citation clicked: use `navigate(url)` + `scrollIntoView()` + highlight animation (3-second yellow background fade)
- **FR-027**: System MUST display relevance score (0.70-1.00) next to each citation with color indicator: red (0.7-0.79), yellow (0.8-0.89), green (0.9-1.0)
- **FR-028**: System MUST show citation preview tooltip on hover: first 100 characters of source paragraph + metadata (chapter, section)

**Backend API & Data Management**:
- **FR-029**: System MUST provide health check endpoint `GET /health` returning `{"status": "ok", "model": "gemini-2.0-flash"}` or error status if Gemini unavailable
- **FR-030**: System MUST provide debug endpoint `GET /chatkit/threads/{thread_id}/debug` returning thread state: message count, created_at, last_message_at, metadata
- **FR-031**: System MUST implement in-memory store (Python dict or similar) for thread and message data with structure: `{thread_id: {messages: [], metadata: {}, created_at: timestamp}}`
- **FR-032**: System MUST handle Gemini/LiteLLM message ID collisions by remapping IDs: if duplicate ID detected, append `-retry-{N}` suffix
- **FR-033**: System MUST log all queries, retrieved chunks, and generated answers to console/file for debugging (include timestamp, thread_id, query, top-3 chunks, answer length)

**Onboarding & Suggested Prompts**:
- **FR-034**: System MUST display start screen with greeting "Welcome to the Physical AI Textbook Assistant!" when no conversation history exists
- **FR-035**: System MUST show 3-5 suggested prompt buttons on start screen with textbook-relevant examples: "Explain forward kinematics", "What is SLAM?", "How do sensors work?", "Tell me about ROS 2"
- **FR-036**: System MUST send suggested prompt as user message when button clicked (same behavior as typing + sending)

### Key Entities

- **Thread**: Represents a conversation session
  - Attributes: `thread_id` (UUID), `created_at` (timestamp), `last_message_at` (timestamp), `metadata` (dict: user preferences, textbook chapter context)
  - Relationships: Contains multiple ThreadItems
  - Lifecycle: Created on first message, persisted in localStorage (client) and in-memory store (backend), deleted when "New Chat" clicked

- **ThreadItem**: Individual message in a conversation
  - Attributes: `item_id` (UUID), `thread_id` (UUID), `role` (enum: "user" | "assistant"), `content` (text), `created_at` (timestamp), `citations` (list of Citation objects), `metadata` (dict: selected_text flag, chunk IDs used)
  - Relationships: Belongs to one Thread
  - Types: User message (role="user"), AI response (role="assistant")

- **Citation**: Reference to textbook source used in AI answer
  - Attributes: `chunk_id` (UUID), `chapter` (int), `section` (string), `heading` (string), `url` (string: `/docs/chapter-X/section-Y#heading`), `similarity_score` (float: 0.0-1.0), `preview_text` (string: first 100 chars)
  - Relationships: Belongs to one ThreadItem (AI response)
  - Display: Rendered as `[Chapter X, Section Y.Z]` clickable link

- **TextbookChunk**: Pre-processed textbook content stored in Qdrant
  - Attributes: `chunk_id` (UUID), `text` (string: 400 tokens), `embedding` (vector: 1536 dimensions), `chapter` (int), `section` (string), `heading` (string), `source_file` (string: path to .md file), `page_number` (int, optional)
  - Relationships: Referenced by Citations
  - Storage: Qdrant vector database (embeddings) + Neon Postgres (metadata)

- **Attachment** *(future feature)*: Optional file attachments associated with thread items
  - Attributes: `attachment_id` (UUID), `item_id` (UUID), `file_name` (string), `file_type` (string), `file_size` (int), `storage_url` (string)
  - Relationships: Belongs to one ThreadItem
  - Status: Storage implemented in backend schema but UI not exposed (Phase 2 feature)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Performance & Responsiveness**:
- **SC-001**: Students receive first token of AI response within 2 seconds of sending message (measured from message submit to first character rendered, includes embedding + Qdrant search + Gemini call)
- **SC-002**: Citation links navigate to correct textbook section and scroll to target paragraph within 500ms of click (95th percentile)
- **SC-003**: Chat modal opens within 300ms of FAB button click on desktop and 500ms on mobile (no perceptible lag)

**Accuracy & Relevance**:
- **SC-004**: 90% of student questions receive answers with at least one citation above 0.8 similarity score (measured on test set of 50 textbook-related questions)
- **SC-005**: Zero hallucinations in responses: 100% of answers verifiable against cited textbook sections (manual review of 20 random responses)
- **SC-006**: Selected-text mode constrains answers correctly: 0% of responses reference information outside selected passage (test set of 15 selected-text questions)

**User Experience & Adoption**:
- **SC-007**: 70% of students who open chatbot send at least one message within first session (engagement rate)
- **SC-008**: 50% of chatbot users click at least one citation link to explore textbook source (discovery rate)
- **SC-009**: 30% of returning students resume previous conversation (localStorage thread recovery rate, measured over 1-week period)
- **SC-010**: Average conversation length is 5+ messages (indicates sustained engagement, not one-off queries)

**Reliability & Error Handling**:
- **SC-011**: System handles 100% of edge cases gracefully: invalid API key → error message, network disconnect → retry option, off-topic questions → polite refusal
- **SC-012**: Health check endpoint responds within 100ms and accurately reflects Gemini API status (99.9% uptime SLA)
- **SC-013**: Conversation persistence works across browser sessions: 95% of threads successfully restored from localStorage after page refresh

**Citation Quality**:
- **SC-014**: 95% of citations navigate to correct textbook location (automated test: parse citation URLs, verify they resolve to expected chapters)
- **SC-015**: Citation relevance scores correlate with human judgment: 80% agreement between automated scores (0.7-1.0) and expert ratings (5 reviewers rate 30 citations as "highly relevant", "relevant", or "not relevant")

---

## Assumptions

- Students have modern browsers supporting JavaScript ES6+, localStorage, and SSE (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Textbook content is already ingested into Qdrant vector database (chunked, embedded, and indexed) before chatbot deployment
- Backend FastAPI server has reliable access to Gemini API (99.9% uptime) with rate limits sufficient for expected student load (assume 100 concurrent users max during hackathon demo)
- Students have stable internet connection for streaming responses (minimum 1 Mbps)
- Docusaurus textbook uses consistent URL structure for chapters and sections (e.g., `/docs/chapter-X/section-name#heading-id`)
- OpenAI ChatKit SDK is compatible with non-OpenAI LLMs (Gemini via LiteLLM) for streaming and thread management
- localStorage is not cleared by browser privacy settings (or students accept loss of conversation history as acceptable tradeoff)
- Average textbook chapter length is 10-20 pages, resulting in 50-100 chunks per chapter (manageable for Qdrant free tier: 1GB storage, 100k vectors)
- Students primarily use chatbot for comprehension questions, not exam cheating (out of scope for this feature to detect academic dishonesty)
- Backend in-memory store is sufficient for hackathon demo (100-200 threads); production would migrate to Neon Postgres for persistence

---

## Out of Scope

The following are explicitly NOT included in this feature specification:

- **Multi-user authentication**: No user accounts, login, or permission system. All students share same chatbot experience (anonymous usage).
- **Chat history export**: No ability to download conversation transcripts as PDF/JSON.
- **Voice input/output**: Text-only interface (no speech-to-text or text-to-speech).
- **Image/diagram questions**: Students cannot upload images or ask "What is this diagram showing?" (text-only queries).
- **Multilingual support**: English only. Urdu translation of chatbot UI deferred to Phase 2.
- **Analytics dashboard**: No admin interface to view chatbot usage statistics, popular questions, or student engagement metrics.
- **Customizable AI personality**: Gemini model behavior is fixed (helpful, academic tone). Students cannot request "explain like I'm 5" or "use emojis".
- **Integration with LMS**: No Moodle, Canvas, or Blackboard integration (standalone tool).
- **Collaborative features**: No ability to share conversations, annotate responses, or comment on AI answers.
- **Attachment support**: No file uploads (PDFs, images, code files) in chat messages.
- **Feedback mechanism**: No thumbs up/down buttons or "report incorrect answer" feature (deferred to Phase 2).
- **Search functionality**: Chatbot is for Q&A only, not a textbook search engine (Docusaurus already has built-in search).

---

## Dependencies

- **Existing chatbot constitution**: This spec must comply with principles defined in `src/chatbot/.specify/memory/constitution.md` (Source Fidelity, Zero Hallucination, Dual-Mode Interaction, Citations)
- **ADR-001 UI Integration Decision**: Implementation must follow Floating Action Button + Modal Popup pattern as decided in `src/chatbot/history/adr/001-chatbot-ui-integration-docusaurus.md`
- **Textbook infrastructure**: Docusaurus site must be running with existing components (AuthProvider, PersonalizationProvider, UrduTranslate) that chatbot must coexist with
- **External services**:
  - OpenAI API for embeddings (`text-embedding-3-small`)
  - Google Gemini API (via LiteLLM) for text generation
  - Qdrant Cloud for vector search (free tier account required)
  - Neon Postgres for metadata storage (free tier account required, optional for hackathon)
- **Browser APIs**: JavaScript Selection API for text selection, localStorage API for thread persistence, SSE API for streaming responses

---

## Next Steps

After this specification is approved:

1. Run `/sp.clarify` if any requirements need further refinement (limit 3 questions)
2. Run `/sp.plan` to create implementation plan with technical architecture
3. Run `/sp.tasks` to generate actionable task breakdown
4. Review against constitution: Verify compliance with 5 core principles (Source Fidelity, RAG Transparency, Dual-Mode Interaction, Zero Hallucination, Citations)
5. Create additional ADRs as needed:
   - ADR-002: ChatKit SDK vs Custom Chat UI (if alternatives considered)
   - ADR-003: Qdrant vs Pinecone/Weaviate for vector store (if benchmarking performed)
   - ADR-004: Gemini vs GPT-4o for text generation (if A/B testing conducted)
