---
id: 003
title: Single-File Agent Task Generation
stage: tasks
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: answer-generation-agent
branch: main
user: developer
command: /sp.tasks
labels: ["tasks", "agent", "single-file", "rag", "openai-sdk"]
links:
  spec: specs/004-answer-generation-agent/spec.md
  plan: specs/004-answer-generation-agent/plan.md
  tasks: specs/004-answer-generation-agent/tasks.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-answer-generation-agent/tasks.md
tests:
  - Task format validation (27/27 tasks follow ID + description + file path format)
  - All tasks reference src/chatbot/backend/agent.py or .env files
  - Sequential dependencies clearly defined across 6 phases
---

## Prompt

/sp.task create a single "agent.py" file at the backend folder
initialize an agent using the OpenAI agents SDK
integrate retrieval by calling the existing qdrant search logs
ensure the agent responds using retrieved book content only

## Response snapshot

Generated streamlined task list for single-file RAG agent implementation with OpenAI SDK integration.

**Task Organization**:
- 6 phases for sequential execution (Setup → Retrieval → Agent → Validation → CLI → Testing)
- 27 total tasks covering single-file implementation
- Focus on simplicity: one file (~200-300 lines), CLI-only interface

**Task Breakdown**:

**Phase 1: Environment & Dependencies Setup** (4 tasks)
- T001: Install OpenAI SDK via UV (`uv add openai`)
- T002: Update .env with OPENROUTER_API_KEY, OPENROUTER_MODEL
- T003: Update .env.example with comments
- T004: Verify existing dependencies (cohere, qdrant-client, python-dotenv from Phase 0)

**Phase 2: Core Agent Implementation** (6 tasks)
- T005: Create agent.py with module docstring
- T006: Add imports (openai, cohere, qdrant_client, os, dotenv, sys)
- T007: Implement load_environment() for env vars
- T008: Implement connect_qdrant() to verify collection exists
- T009: Implement generate_query_embedding() using Cohere (reuse retrieve.py logic)
- T010: Implement search_qdrant_tool() to perform vector search and return chunks

**Phase 3: OpenAI Agent Integration** (4 tasks)
- T011: Implement create_rag_agent() with OpenRouter base URL (https://openrouter.ai/api/v1)
- T012: Define system prompt enforcing book-only grounding ("Use only provided book content", "Preserve exact terminology", "Include citations", "Refuse if insufficient grounding")
- T013: Implement query_agent() function: search → format context → send to OpenAI → return response
- T014: Add citation extraction logic to parse chapter/section/URL from agent response

**Phase 4: Refusal Logic & Validation** (4 tasks)
- T015: Add empty results check (0 chunks → refusal message)
- T016: Add low relevance check (top-1 score < 0.4 → refusal)
- T017: Implement validate_response() to check: contains book content, citations present
- T018: Add fallback refusal if validation fails

**Phase 5: CLI Interface & Main Entry Point** (4 tasks)
- T019: Implement main() with argparse (--query required, --top-k, --verbose)
- T020: Add formatted output (print answer, citations, metadata)
- T021: Add error handling (missing env vars, Qdrant failures, OpenRouter errors)
- T022: Add `if __name__ == "__main__":` guard

**Phase 6: Testing & Documentation** (5 tasks)
- T023: Test happy path (`uv run agent.py --query "What is Physical AI?"`)
- T024: Test refusal (`uv run agent.py --query "How do I train GPT-4?"`)
- T025: Test retrieval integration with --verbose flag
- T026: Add comprehensive docstrings to all functions
- T027: Add usage examples to module docstring

**Key Design Decisions**:

1. **Single-File Constraint**: All logic in agent.py (~200-300 lines)
   - Rationale: User explicitly requested single file for simplicity
   - Trade-off: Less modular, but easier to understand and deploy

2. **Reuse Existing Infrastructure**: Copy logic from retrieve.py for Qdrant search
   - Rationale: Don't reinvent Qdrant integration, proven working code exists
   - Implementation: T009 (generate_query_embedding), T010 (search_qdrant_tool)

3. **OpenAI SDK via OpenRouter**: Set base_url to https://openrouter.ai/api/v1
   - Rationale: OpenRouter provides OpenAI-compatible API for flexible model access
   - Configuration: T011 (create_rag_agent with custom base URL)

4. **System Prompt as Grounding Enforcement**: Critical for zero hallucination
   - Content: "Use only provided book content, no external knowledge"
   - Implementation: T012 (define system prompt)

5. **Refusal Threshold = 0.4**: Conservative threshold for low relevance
   - Rationale: Prefer refusal over hallucination (matches research.md decision)
   - Implementation: T016 (low relevance check)

6. **CLI-Only Interface**: No FastAPI, no web server (simplest implementation)
   - Rationale: User requested single file, web server adds complexity
   - Implementation: T019-T022 (argparse CLI)

**MVP Path** (15 tasks for minimal working agent):
1. T001-T004 (Setup)
2. T005-T010 (Core retrieval integration)
3. T011-T013 (Basic agent without validation)
4. T019, T022 (Minimal CLI)
5. T023 (Happy path test)

**Full Implementation Path** (all 27 tasks):
- MVP + T014 (citations) + T015-T018 (refusal/validation) + T020-T021 (enhanced CLI) + T024-T027 (full testing/docs)

**Validation Checklist** (11 items):
- [ ] agent.py exists and is executable
- [ ] Uses OpenAI SDK (not direct API calls)
- [ ] Reuses existing Qdrant infrastructure
- [ ] System prompt enforces book-only grounding
- [ ] Refusal messages returned when retrieval insufficient
- [ ] Citations included in successful responses
- [ ] CLI accepts --query flag
- [ ] Happy path test passes (in-scope → answer + citations)
- [ ] Refusal test passes (out-of-scope → refusal message)
- [ ] All functions have docstrings
- [ ] .env.example updated

**Completion Criteria**:
1. Single agent.py file implements complete RAG workflow
2. OpenAI SDK integrated with OpenRouter
3. Retrieval uses existing Qdrant infrastructure
4. Agent responds using only retrieved book content
5. Refusal logic works for out-of-scope questions
6. Citations included in answers
7. CLI interface functional
8. Happy path and refusal tests pass
9. Documentation complete

**Estimated Effort**:
- Setup: 15 minutes (4 tasks)
- Retrieval integration: 45 minutes (6 tasks)
- Agent integration: 1 hour (4 tasks)
- Validation: 45 minutes (4 tasks)
- CLI: 30 minutes (4 tasks)
- Testing & docs: 30 minutes (5 tasks)
- **Total**: ~4 hours for single-file implementation

**Deliverable**:
- ✅ `src/chatbot/backend/agent.py` (~200-300 lines)
- ✅ Updated `.env.example`

## Outcome

- ✅ **Impact**: Streamlined task list for single-file RAG agent; 27 tasks across 6 phases; MVP path identified (15 tasks); focused on user requirements (single file, OpenAI SDK, existing Qdrant, book-only grounding)
- 🧪 **Tests**: Task format validation 27/27 PASS; sequential dependencies defined; all tasks reference specific file paths; validation checklist has 11 concrete items
- 📁 **Files**:
  - tasks.md (27 tasks organized by phase with MVP path and completion criteria)
- 🔁 **Next prompts**:
  1. Implement tasks: `/sp.implement` (execute all 27 tasks to create agent.py)
  2. Or implement MVP only: Manually execute T001-T010, T011-T013, T019, T022-T023 (15 tasks for minimal agent)
- 🧠 **Reflection**: User requested simplified single-file implementation vs. the full 3-agent architecture in plan.md. Adapted by creating streamlined tasks.md focusing on single agent.py file (~200-300 lines) with OpenAI SDK, existing Qdrant integration, and CLI interface. Key simplifications: (1) No FastAPI/web server, (2) No separate planner/retriever/answer generator agents (all in one file), (3) No PostgreSQL session tracking, (4) CLI-only interface for testing. Maintained core requirements: OpenAI SDK integration (T011), Qdrant reuse (T009-T010), book-only grounding (T012 system prompt), refusal logic (T015-T018), citations (T014). MVP path (15 tasks) enables rapid prototyping, full path (27 tasks) adds robustness. Estimated 4 hours total - achievable for single developer in one session.

## Evaluation notes (flywheel)

- **Failure modes observed**: None; task generation completed successfully
- **Graders run and results (PASS/FAIL)**:
  - Task format - PASS (27/27 tasks follow ID + description + file path format)
  - File path specificity - PASS (all tasks reference src/chatbot/backend/agent.py or .env)
  - Sequential dependencies - PASS (6 phases with clear ordering)
  - Scope alignment - PASS (tasks match user requirements: single file, OpenAI SDK, Qdrant integration)
  - Testability - PASS (T023-T025 define concrete test scenarios)
  - Documentation - PASS (T026-T027 ensure all functions documented)
- **Prompt variant (if applicable)**: User provided simplified requirements (single file) vs. original plan.md (multi-agent architecture); successfully adapted task list to match user intent while maintaining core grounding constraints
- **Next experiment (smallest change to try)**: For next task generation, test whether including "task acceptance criteria" (e.g., "T011 complete when OpenAI client initializes successfully") in each task description improves clarity vs. relying on phase-level checkpoints alone.
