# Feature Specification: RAG Book Assistant

**Feature Branch**: `002-rag-book-assistant`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "RAG BOOK ASSISTANT - An AI assistant embedded inside a published technical book with strict knowledge boundaries and hallucination prevention"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Context-Based Question Answering (Priority: P1)

A reader is reading a technical book and encounters a concept they don't fully understand. They highlight the relevant section and ask the assistant a question about it. The assistant provides an accurate answer using only the information from the selected text and retrieved book context.

**Why this priority**: This is the core value proposition - helping readers understand book content as they read. Without this, the feature has no purpose.

**Independent Test**: Can be fully tested by providing sample book content, asking questions about it, and verifying answers come only from the provided context. Delivers immediate value by helping readers comprehend difficult sections.

**Acceptance Scenarios**:

1. **Given** a reader has retrieved context about "Vector Databases" from the book, **When** they ask "What are vector databases?", **Then** the assistant provides an answer citing only the retrieved context and includes source attribution (chapter, section)
2. **Given** a reader selects text about a specific algorithm, **When** they ask "How does this algorithm work?", **Then** the assistant explains using only the selected text without adding external knowledge
3. **Given** retrieved context doesn't contain information about a question, **When** the reader asks about an unrelated topic, **Then** the assistant responds "The book content provided does not contain information to answer this question"

---

### User Story 2 - Selected Text Analysis (Priority: P1)

A reader selects a specific paragraph or section from the book and asks a question specifically about that selection. The assistant must analyze only the selected text, ignoring all other knowledge including the vector database.

**Why this priority**: Critical for focused learning - readers need to understand specific passages without contamination from other content. This is a fundamental interaction mode.

**Independent Test**: Can be tested by providing selected text and verifying the assistant never references content outside the selection, even if related content exists in the vector database.

**Acceptance Scenarios**:

1. **Given** a reader selects text containing a code example, **When** they ask "What does this code do?", **Then** the assistant explains using only the visible code in the selection
2. **Given** a reader selects a paragraph from Chapter 3, **When** they ask a question that would require information from Chapter 4, **Then** the assistant responds "The selected text does not contain this information"
3. **Given** a reader selects text and asks for clarification, **When** the answer exists in both the selection and the vector database, **Then** the assistant uses only the selected text

---

### User Story 3 - Hallucination Prevention and Refusal (Priority: P2)

When a reader asks a question that cannot be answered from the provided book content, the assistant must refuse gracefully rather than speculating or using general AI knowledge.

**Why this priority**: Essential for trust and accuracy, but secondary to the primary answering capability. Readers must know when the book doesn't cover a topic.

**Independent Test**: Can be tested by asking questions about topics not in the book and verifying the assistant never invents answers or uses training data.

**Acceptance Scenarios**:

1. **Given** no retrieved context is available, **When** a reader asks "What is quantum computing?", **Then** the assistant responds with a refusal message explaining the book content doesn't address this
2. **Given** retrieved context partially covers a topic, **When** a reader asks a question requiring information not in the context, **Then** the assistant answers only what's covered and explicitly states what's missing
3. **Given** a reader asks about recent events or updates, **When** the book was published before those events, **Then** the assistant refuses and explains the book's knowledge boundary

---

### User Story 4 - Source Attribution and Navigation (Priority: P3)

When answering questions, the assistant provides clear attribution to the source material (chapter, section, URL) so readers can navigate to the original content for deeper study.

**Why this priority**: Enhances learning by helping readers find and reference source material, but the core functionality works without it.

**Independent Test**: Can be tested by checking that responses include metadata when available and formatting follows the specified pattern.

**Acceptance Scenarios**:

1. **Given** retrieved context includes chapter and section metadata, **When** the assistant answers a question, **Then** the response includes "According to Chapter [X], Section '[Y]', ..."
2. **Given** retrieved context includes a URL or document identifier, **When** the assistant answers, **Then** the response includes the URL for reference
3. **Given** context metadata is incomplete, **When** the assistant answers, **Then** it includes whatever source information is available

---

### Edge Cases

- What happens when the selected text is too short or incomplete to answer the question?
- How does the system handle questions that span multiple disconnected sections of the book?
- What if the vector database returns no results for a query?
- How does the assistant handle ambiguous questions that could be interpreted multiple ways based on limited context?
- What happens when retrieved context chunks contradict each other?
- How does the system respond if the reader asks it to perform actions outside its scope (e.g., "write code", "search the web")?
- What if metadata (chapter, section, URL) is malformed or missing entirely?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST answer questions using only information explicitly provided in retrieved context from the vector database (Qdrant) or user-selected text
- **FR-002**: System MUST refuse to use prior training knowledge, general AI knowledge, or any information not present in the provided content
- **FR-003**: System MUST distinguish between two answering modes: (1) Standard mode using vector database context, and (2) Selected-text-only mode using exclusively the user's text selection
- **FR-004**: System MUST refuse to answer when the provided content does not contain sufficient information, using explicit refusal messages
- **FR-005**: System MUST include source attribution (chapter name, section heading, URL, or document identifier) when metadata is available
- **FR-006**: System MUST prevent hallucination by never speculating, guessing, generalizing beyond the text, or merging disconnected ideas
- **FR-007**: System MUST maintain a clear, professional, instructional tone without emojis, conversational filler, or marketing language
- **FR-008**: System MUST preserve the author's original meaning and intent without modification or reinterpretation
- **FR-009**: System MUST refuse to provide legal, medical, or financial advice unless explicitly stated in the book
- **FR-010**: System MUST handle missing or incomplete context gracefully by acknowledging information gaps rather than filling them
- **FR-011**: System MUST treat retrieved context chunks and selected user text as authoritative and immutable

### Key Entities

- **Book Content**: The published technical material stored in the vector database, including text, code examples, diagrams, and explanatory content
  - Attributes: chapter, section, subsection, content type (text/code/diagram), original formatting
  - Metadata: chapter number/name, section heading, page number, URL/document identifier

- **Retrieved Context**: Chunks of book content returned by the vector database (Qdrant) in response to user queries
  - Attributes: content text, relevance score, source metadata
  - Relationships: Multiple chunks may be returned per query; chunks must be from the same book

- **Selected Text**: User-highlighted or selected portions of book content for focused analysis
  - Attributes: raw text, position/location reference, length
  - Constraints: Must be actual book content, not user-generated text

- **User Query**: Questions or requests submitted by the reader
  - Attributes: question text, query mode (standard vs selected-text-only), context availability
  - Relationships: Associated with either retrieved context or selected text (or both)

- **Response**: Assistant's answer to a user query
  - Attributes: answer text, source attribution, refusal status (answered/refused)
  - Relationships: Must map directly to specific content in retrieved context or selected text

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of assistant responses contain only information present in the provided context (retrieved or selected text), with zero instances of external knowledge injection
- **SC-002**: When context is insufficient, the assistant refuses to answer 100% of the time with appropriate refusal messages
- **SC-003**: In selected-text-only mode, 100% of responses reference exclusively the selected text, with no vector database content used
- **SC-004**: Source attribution is included in 90% of responses when metadata is available in the context
- **SC-005**: Readers can verify the accuracy of every answer by tracing it back to the specific book content referenced
- **SC-006**: Zero instances of hallucinated information, speculation, or answers based on general AI knowledge in testing scenarios
- **SC-007**: 95% of readers successfully get answers to questions covered by book content on first attempt
- **SC-008**: Response time for answering questions is under 3 seconds for 95% of queries
- **SC-009**: The assistant correctly identifies and refuses questions outside book scope 100% of the time

### User Experience Goals

- Readers trust the assistant as an accurate, source-faithful companion to the book
- Readers can learn effectively without worrying about misinformation or hallucinated content
- Readers can easily navigate back to source material using provided attribution
- The assistant feels like a natural extension of the book, not a separate AI tool

## Assumptions *(mandatory)*

- The vector database (Qdrant) is already populated with book content and provides relevant retrieval results
- Retrieved context includes metadata (chapter, section, URL) when available, though completeness may vary
- Users will primarily interact through a text-based interface where they can input questions and optionally provide selected text
- The book content is technical in nature and benefits from an AI assistant for comprehension
- User queries will be in natural language (English assumed as default)
- The system can distinguish between standard query mode and selected-text-only mode through an explicit user signal or interface control
- Book content is static (not updated in real-time during reading sessions)
- A single book instance per assistant (not multi-book queries)

## Out of Scope

- Generating new content not present in the book
- Providing opinions or analysis beyond what the book states
- Updating or modifying book content
- Multi-book comparative analysis
- Translation or localization of book content
- Summarizing entire chapters (only answering specific questions based on retrieved/selected content)
- Conversational features unrelated to book comprehension (e.g., small talk, personal advice)
- Authentication or user management
- Book content ingestion or vector database population
- Handling non-text content types (images, videos) beyond what's embedded in text descriptions

## Dependencies

- Vector database (Qdrant) must be operational and accessible
- Book content must be pre-loaded into the vector database with appropriate chunking and metadata
- Backend API/service to handle query routing, context retrieval, and assistant invocation (e.g., OpenRouter or similar AI service)
- Metadata extraction from book content during ingestion (for source attribution)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vector database returns irrelevant or incomplete context | Assistant provides incorrect refusals or partial answers | Improve retrieval algorithms; provide fallback messaging that explains limited context availability |
| User selects text ambiguously (e.g., partial sentences, code fragments) | Answers may be incomplete or confusing | Detect incomplete selections and ask for clarification; provide minimum selection length guidance |
| Metadata missing from retrieved context | No source attribution possible, reducing trust | Handle gracefully by answering without attribution; log metadata gaps for content improvement |
| User attempts to trick the assistant into using external knowledge | Breaks the "only book content" guarantee | Strict validation and testing of refusal logic; clear system prompts enforcing boundaries |
| Contradictory information in different book sections | Assistant may provide conflicting answers depending on retrieved context | Detect contradictions when multiple chunks are returned; surface both viewpoints to the user |
