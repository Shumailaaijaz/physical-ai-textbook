# Tasks: Single-File RAG Agent Implementation

**Input**: User requirements: "Create a single agent.py file at the backend folder, initialize an agent using the OpenAI agents SDK, integrate retrieval by calling the existing qdrant search logs, ensure the agent responds using retrieved book content only"

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Scope**: Single-file RAG agent (`agent.py`) that integrates with existing Qdrant infrastructure, uses OpenAI SDK for agent orchestration, and enforces strict book-only grounding.

**Organization**: Tasks are organized by implementation phase to enable sequential execution.

## Format: `[ID] Description`

- Include exact file paths in descriptions
- Mark dependencies where applicable

## Path Conventions

- **Agent File**: `src/chatbot/backend/agent.py`
- **Env**: `src/chatbot/backend/.env` (existing, will be updated with new vars)
- **Env Example**: `src/chatbot/backend/.env.example` (existing, will be updated)

---

## Phase 1: Environment & Dependencies Setup

**Purpose**: Prepare environment and install required packages

- [ ] T001: Install OpenAI SDK dependency via UV: `cd src/chatbot/backend && uv add openai`
- [ ] T002: Update src/chatbot/backend/.env with OPENROUTER_API_KEY and OPENROUTER_MODEL (default: openai/gpt-3.5-turbo)
- [ ] T003: Update src/chatbot/backend/.env.example with new environment variables and comments explaining usage
- [ ] T004: Verify existing dependencies are available (cohere, qdrant-client, python-dotenv from Phase 0)

**Checkpoint**: Environment configured, all dependencies installed

---

## Phase 2: Core Agent Implementation

**Purpose**: Create single-file RAG agent with retrieval integration

- [ ] T005: Create src/chatbot/backend/agent.py with module-level docstring explaining purpose (RAG agent with strict book grounding)
- [ ] T006: Add imports to src/chatbot/backend/agent.py: openai, cohere, qdrant_client, os, dotenv, sys
- [ ] T007: Implement load_environment() function in src/chatbot/backend/agent.py to load OPENROUTER_API_KEY, OPENROUTER_MODEL, QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY from .env
- [ ] T008: Implement connect_qdrant() function in src/chatbot/backend/agent.py to initialize QdrantClient and verify 'rag_embeddings' collection exists
- [ ] T009: Implement generate_query_embedding() function in src/chatbot/backend/agent.py using Cohere embed-multilingual-v3.0 with input_type="search_query" (reuse logic from retrieve.py)
- [ ] T010: Implement search_qdrant_tool() function in src/chatbot/backend/agent.py to perform vector search: generate embedding → query Qdrant → return List[dict] with text, chapter, section, source_url, score

**Checkpoint**: Retrieval logic integrated, can search Qdrant and return chunks

---

## Phase 3: OpenAI Agent Integration

**Purpose**: Initialize OpenAI agent with strict grounding system prompt

- [ ] T011: Implement create_rag_agent() function in src/chatbot/backend/agent.py to initialize OpenAI client with OpenRouter base URL (https://openrouter.ai/api/v1)
- [ ] T012: Define system prompt in src/chatbot/backend/agent.py enforcing: "Use only provided book content", "Preserve exact terminology", "Include citations", "Refuse if insufficient grounding"
- [ ] T013: Implement query_agent() function in src/chatbot/backend/agent.py that: 1) calls search_qdrant_tool(), 2) formats chunks as context, 3) sends to OpenAI agent with system prompt, 4) returns response
- [ ] T014: Add citation extraction logic to query_agent() in src/chatbot/backend/agent.py to parse chapter/section/URL from agent response and structure as JSON

**Checkpoint**: Agent can accept query, retrieve context, generate grounded answer

---

## Phase 4: Refusal Logic & Validation

**Purpose**: Implement refusal behavior when grounding is insufficient

- [ ] T015: Add empty results check to query_agent() in src/chatbot/backend/agent.py: if search returns 0 chunks → return refusal message "The provided book content does not contain sufficient information to answer this question"
- [ ] T016: Add low relevance check to query_agent() in src/chatbot/backend/agent.py: if top-1 chunk score < 0.4 → return refusal message
- [ ] T017: Implement validate_response() function in src/chatbot/backend/agent.py to check: 1) response contains book content (not external knowledge), 2) citations present
- [ ] T018: Add fallback refusal logic: if validate_response() fails → return refusal instead of potentially hallucinated answer

**Checkpoint**: Agent refuses when grounding insufficient, validates responses

---

## Phase 5: CLI Interface & Main Entry Point

**Purpose**: Add command-line interface for testing

- [ ] T019: Implement main() function in src/chatbot/backend/agent.py with argparse CLI: --query (required), --top-k (default=5), --verbose flags
- [ ] T020: Add formatted output to main() in src/chatbot/backend/agent.py: print answer, citations, and chunk metadata (if --verbose)
- [ ] T021: Add error handling in main() in src/chatbot/backend/agent.py for: missing env vars, Qdrant connection failures, OpenRouter API errors
- [ ] T022: Add if __name__ == "__main__": guard to src/chatbot/backend/agent.py to call main()

**Checkpoint**: Agent runnable via CLI with `uv run agent.py --query "How does ROS 2 work?"`

---

## Phase 6: Testing & Documentation

**Purpose**: Validate functionality and document usage

- [ ] T023: Test happy path: Run `cd src/chatbot/backend && uv run agent.py --query "What is Physical AI?"` and verify answer with citations
- [ ] T024: Test refusal case: Run `uv run agent.py --query "How do I train GPT-4?"` and verify refusal message
- [ ] T025: Test retrieval integration: Run `uv run agent.py --query "How does ROS 2 work?" --verbose` and verify Qdrant chunks are displayed
- [ ] T026: Add comprehensive docstrings to all functions in src/chatbot/backend/agent.py (Google or NumPy style)
- [ ] T027: Add usage examples to module docstring in src/chatbot/backend/agent.py with sample commands and expected outputs

**Checkpoint**: Agent tested end-to-end, fully documented

---

## Execution Strategy

### Sequential Dependencies

1. **Phase 1 (Setup)** → Must complete T001-T004 before coding
2. **Phase 2 (Retrieval)** → T005-T010 build core retrieval logic
3. **Phase 3 (Agent)** → T011-T014 integrate OpenAI SDK (depends on Phase 2)
4. **Phase 4 (Validation)** → T015-T018 add safety checks (depends on Phase 3)
5. **Phase 5 (CLI)** → T019-T022 add user interface (depends on Phase 4)
6. **Phase 6 (Testing)** → T023-T027 validate and document (final phase)

### Suggested MVP Implementation Order

**MVP Goal**: Minimal working agent that can answer one question with Qdrant retrieval

1. T001-T004 (Setup)
2. T005-T010 (Retrieval integration)
3. T011-T013 (Basic agent without validation)
4. T019, T022 (Minimal CLI for testing)
5. T023 (Happy path test)

Then expand incrementally:
6. T014 (Citation extraction)
7. T015-T018 (Refusal logic and validation)
8. T020-T021 (Enhanced CLI and error handling)
9. T024-T027 (Full testing and documentation)

---

## Validation Checklist

Before marking complete, verify:

- [ ] src/chatbot/backend/agent.py exists and is executable
- [ ] Agent uses OpenAI SDK (not direct API calls)
- [ ] Retrieval calls existing Qdrant infrastructure (reuses retrieve.py logic)
- [ ] System prompt enforces book-only grounding
- [ ] Refusal messages returned when retrieval empty or low relevance
- [ ] Citations included in successful responses
- [ ] CLI accepts --query flag and returns answer
- [ ] Happy path test passes (in-scope question → answer with citations)
- [ ] Refusal test passes (out-of-scope question → refusal message)
- [ ] All functions have docstrings
- [ ] .env.example updated with new variables

---

## Completion Criteria

**Definition of Done**:
1. Single agent.py file implements complete RAG workflow
2. OpenAI SDK integrated with OpenRouter
3. Retrieval uses existing Qdrant infrastructure
4. Agent responds using only retrieved book content
5. Refusal logic works for out-of-scope questions
6. Citations included in answers
7. CLI interface functional for testing
8. Happy path and refusal tests pass
9. Documentation complete (docstrings, usage examples)

**Deliverables**:
- ✅ `src/chatbot/backend/agent.py` (~200-300 lines)
- ✅ Updated `src/chatbot/backend/.env.example`
- ✅ Tested end-to-end with diverse queries

**Next Phase**: Optionally expand to FastAPI endpoint (out of scope for single-file task)

---

## Task Summary

**Total Tasks**: 27
- Phase 1 (Setup): 4 tasks
- Phase 2 (Retrieval): 6 tasks
- Phase 3 (Agent): 4 tasks
- Phase 4 (Validation): 4 tasks
- Phase 5 (CLI): 4 tasks
- Phase 6 (Testing): 5 tasks

**Estimated Effort**:
- Setup: 15 minutes
- Retrieval integration: 45 minutes
- Agent integration: 1 hour
- Validation: 45 minutes
- CLI: 30 minutes
- Testing & documentation: 30 minutes
- **Total**: ~4 hours for single-file implementation

**Dependencies**:
- External: OpenRouter API key (new), Cohere API key (existing), Qdrant cluster (existing)
- Internal: Phase 0 ingestion complete (rag_embeddings collection populated)

---

## Implementation Notes

- **Single-file design**: All logic in agent.py (~200-300 lines total)
- **Reuse existing code**: Copy logic from retrieve.py for Qdrant search
- **OpenAI SDK via OpenRouter**: Set base_url to https://openrouter.ai/api/v1
- **System prompt is critical**: Must enforce "use only book content, no external knowledge"
- **Refusal threshold**: If top-1 chunk score < 0.4, refuse to answer
- **Citation format**: Include chapter, section, source URL in response
- **CLI-only**: No web server, no API endpoints (simplest implementation)

---

## Key Constraints

- **Book-only grounding**: Agent must NEVER use external knowledge
- **Mandatory refusals**: Better to refuse than hallucinate
- **Exact terminology**: Preserve book's exact terms (no synonym substitution)
- **Citation requirement**: Every answer must cite sources
- **Reuse infrastructure**: Don't reimplement Qdrant logic, reuse from retrieve.py
- **Single file**: No multi-file architecture (keep it simple)

---

## Success Indicators

**The implementation is successful when**:
1. `uv run agent.py --query "What is Physical AI?"` returns grounded answer with citations
2. `uv run agent.py --query "How do I train GPT-4?"` returns refusal (out of scope)
3. Agent response contains exact book terminology (not paraphrased)
4. Citations include chapter/section/URL from Qdrant metadata
5. No external knowledge appears in answers (100% book grounding)
6. Code is clean, documented, and under 300 lines
