# Tasks: Retrieval & Pipeline Validation

**Input**: Design documents from `/specs/003-retrieval-validation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Scope**: Single-file validation script (`retrieve.py`) that verifies RAG retrieval pipeline correctness after Phase 0 ingestion.

**Organization**: Tasks are organized by user story (P0, P1) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label ([US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Script**: `src/chatbot/backend/retrieve.py`
- **Env**: `src/chatbot/backend/.env` (existing, reused from Phase 0)
- **Env Example**: `src/chatbot/backend/.env.example` (existing, may need updates)

---

## Phase 1: Project Setup

**Purpose**: Prepare environment and create script skeleton

- [x] T001 Create src/chatbot/backend/retrieve.py with file header, imports, and main() entry point
- [x] T002 Add NamedTuple definitions for QueryRequest, QueryEmbedding, RetrievedChunk, ValidationCheck, ValidationReport to src/chatbot/backend/retrieve.py
- [x] T003 Implement argparse CLI parsing in src/chatbot/backend/retrieve.py (--query, --top-k, --min-score flags with defaults)
- [x] T004 Verify existing dependencies are sufficient (cohere, qdrant-client, python-dotenv, tenacity) - no new installs needed

**Checkpoint**: Script skeleton with data models and CLI parsing ready

---

## Phase 2: User Story 1 - Developer Validates Retrieval Pipeline (P0)

**Story Goal**: Enable developers to run validation script that confirms vector search works correctly

**Independent Test Criteria**:
1. Script accepts test query and runs without errors
2. Connects to Qdrant and verifies collection exists
3. Generates query embedding and performs search
4. Returns results with complete metadata
5. Prints structured validation report with PASS/FAIL status
6. Exit code reflects validation outcome (0=PASS, 1=FAIL, 2=WARNING)

### Connection & Configuration Validation (FR-002, FR-003, FR-004)

- [x] T005 [US1] Implement load_environment() function in src/chatbot/backend/retrieve.py to load QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY from .env
- [x] T006 [US1] Implement validate_connection() function in src/chatbot/backend/retrieve.py to connect to Qdrant and verify collection 'rag_embeddings' exists
- [x] T007 [US1] Implement validate_collection_config() function in src/chatbot/backend/retrieve.py to check vector size=1024 and distance=cosine

### Query Embedding & Search (FR-001, FR-005, FR-006)

- [x] T008 [US1] Implement generate_query_embedding() function in src/chatbot/backend/retrieve.py using Cohere embed-multilingual-v3.0 with input_type="search_query"
- [x] T009 [US1] Add retry logic to generate_query_embedding() in src/chatbot/backend/retrieve.py using tenacity (1 retry, 2s wait for transient failures)
- [x] T010 [US1] Implement perform_search() function in src/chatbot/backend/retrieve.py to execute query_points() with top-k parameter

### Result Validation (FR-007, FR-008)

- [x] T011 [US1] Implement validate_results() function in src/chatbot/backend/retrieve.py to check metadata completeness (text, source_url required)
- [x] T012 [US1] Add score validation logic to validate_results() in src/chatbot/backend/retrieve.py (range 0.0-1.0, descending order)

### Report Generation & Error Handling (FR-009, FR-010)

- [x] T013 [US1] Implement print_report() function in src/chatbot/backend/retrieve.py to display structured validation report with ASCII symbols ([OK]/[FAIL]/[WARN])
- [x] T014 [US1] Add comprehensive error handling in src/chatbot/backend/retrieve.py with actionable error messages for all failure modes
- [x] T015 [US1] Implement exit code logic in main() function in src/chatbot/backend/retrieve.py (0=PASS, 1=FAIL, 2=WARNING)

### Integration & Testing

- [x] T016 [US1] Wire all functions together in main() orchestration flow in src/chatbot/backend/retrieve.py
- [x] T017 [US1] Test happy path: Run `uv run retrieve.py` with default query and verify PASS status
- [x] T018 [US1] Test error scenario: Run with missing .env variables and verify actionable error message

**Story 1 Completion**: Developer can validate retrieval pipeline end-to-end

---

## Phase 3: User Story 2 - QA Engineer Verifies Data Quality (P1)

**Story Goal**: Enable QA to validate metadata completeness and correctness in retrieved chunks

**Independent Test Criteria**:
1. Script checks required fields (text, source_url) in all chunks
2. Reports missing or malformed metadata with specific chunk IDs
3. Validates source URLs match expected domain
4. Confirms similarity scores are in valid range
5. Verifies results are ordered by descending score

**Dependencies**: Requires User Story 1 (validation framework)

### Enhanced Metadata Validation (FR-007)

- [x] T019 [US2] Enhance validate_results() in src/chatbot/backend/retrieve.py to check source URL format (must start with https://shumailaaijaz.github.io/physical-ai-textbook/)
- [x] T020 [US2] Add optional metadata checks to validate_results() in src/chatbot/backend/retrieve.py (chapter, section as WARNING if missing)
- [x] T021 [US2] Implement affected_items tracking in ValidationCheck creation in src/chatbot/backend/retrieve.py to report chunk IDs with issues

### Score & Ordering Validation (FR-008)

- [x] T022 [US2] Add detailed score range validation in validate_results() in src/chatbot/backend/retrieve.py with specific failure messages
- [x] T023 [US2] Implement descending score order check in validate_results() in src/chatbot/backend/retrieve.py

### Enhanced Reporting

- [x] T024 [US2] Update print_report() in src/chatbot/backend/retrieve.py to display metadata quality summary (e.g., "5/5 chunks complete")
- [x] T025 [US2] Add affected_items display to print_report() in src/chatbot/backend/retrieve.py for failed validation checks

### Testing

- [x] T026 [US2] Test metadata validation: Run with chunk missing source_url and verify FAIL with chunk ID
- [x] T027 [US2] Test score validation: Verify invalid scores are detected and reported

**Story 2 Completion**: QA can validate data quality comprehensively

---

## Phase 4: User Story 3 - DevOps Tests Connection Reliability (P1)

**Story Goal**: Enable DevOps to verify Qdrant connection stability and configuration

**Independent Test Criteria**:
1. Script reads connection details from environment variables
2. Validates connection before attempting queries
3. Reports connection status and collection statistics
4. Fails fast with clear error messages for connection issues

**Dependencies**: Requires User Story 1 (connection validation framework)

### Environment Variable Validation (FR-002)

- [x] T028 [US3] Add environment variable presence check in load_environment() in src/chatbot/backend/retrieve.py before Qdrant/Cohere initialization
- [x] T029 [US3] Implement fail-fast logic in validate_connection() in src/chatbot/backend/retrieve.py if environment variables are missing

### Connection Diagnostics

- [x] T030 [US3] Add collection statistics logging to validate_connection() in src/chatbot/backend/retrieve.py (print total points count)
- [x] T031 [US3] Enhance error messages in validate_connection() in src/chatbot/backend/retrieve.py to distinguish network vs. auth vs. config issues

### Testing

- [x] T032 [US3] Test missing credentials: Run with empty QDRANT_API_KEY and verify clear error message
- [x] T033 [US3] Test network timeout: Simulate unreachable Qdrant URL and verify timeout error message
- [x] T034 [US3] Test wrong collection config: Verify dimension mismatch error if collection has wrong vector size

**Story 3 Completion**: DevOps can validate production environment setup

---

## Phase 5: Documentation & Polish

**Purpose**: Finalize documentation, add docstrings, ensure production-readiness

- [x] T035 [P] Add comprehensive docstrings to all functions in src/chatbot/backend/retrieve.py (Google or NumPy style)
- [x] T036 [P] Add module-level docstring to src/chatbot/backend/retrieve.py explaining purpose, usage, exit codes
- [x] T037 [P] Update src/chatbot/backend/.env.example with comments explaining required variables (if not already present)
- [x] T038 [P] Verify all error messages follow "❌ FAIL: [Check Name]\nReason: [Explanation]\nSuggested fix: [Action]" format in src/chatbot/backend/retrieve.py
- [x] T039 [P] Test full validation workflow end-to-end with diverse queries and verify all validation checks execute

**Checkpoint**: Production-ready validation script with complete documentation

---

## Execution Strategy

### Sequential Dependencies

1. **Phase 1 (Setup)** → Must complete T001-T004 before user stories
2. **Phase 2 (US1)** → T005-T018 provide core validation framework
3. **Phase 3 (US2)** → T019-T027 enhance metadata validation (depends on T011, T012, T013)
4. **Phase 4 (US3)** → T028-T034 enhance connection diagnostics (depends on T006, T014)
5. **Phase 5 (Polish)** → T035-T039 can run anytime after Phase 2

### Parallel Execution Opportunities

**Batch 1 - Setup (sequential)**:
- T001 → T002 → T003 → T004

**Batch 2 - User Story 1 Core (mostly sequential, some parallelization)**:
- T005, T006, T007 (can run in parallel after T001-T004)
- T008 → T009 (sequential: retry depends on base function)
- T010 (can run in parallel with T008-T009)
- T011, T012 (can run in parallel after T010)
- T013 (can run in parallel with T011-T012)
- T014 → T015 → T016 (sequential: orchestration depends on error handling)
- T017, T018 (can run in parallel after T016)

**Batch 3 - User Stories 2 & 3 (independent, can run in parallel)**:
- User Story 2: T019-T027 (enhance metadata validation)
- User Story 3: T028-T034 (enhance connection diagnostics)
- These two stories can be implemented in parallel by different developers

**Batch 4 - Polish (all parallel after US1 complete)**:
- T035, T036, T037, T038, T039 (all independent)

### Suggested MVP Implementation Order

**MVP Goal**: Minimal working validation for a single test query

1. T001-T004 (Setup)
2. T005-T010 (Connection, embedding, search - core US1 flow)
3. T011-T013 (Validation and reporting)
4. T016 (Orchestration)
5. T017 (Happy path test)

Then expand incrementally:
6. T014-T015 (Error handling and exit codes)
7. T018 (Error scenario test)
8. T019-T027 (US2: Enhanced metadata validation)
9. T028-T034 (US3: Connection diagnostics)
10. T035-T039 (Polish)

---

## Validation Checklist

Before marking complete, verify:

- [ ] All 39 tasks completed
- [ ] src/chatbot/backend/retrieve.py exists and is executable
- [ ] All 3 user stories independently testable
- [ ] Script accepts CLI arguments (--query, --top-k, --min-score)
- [ ] All 6 validation checks implemented (connection, collection config, embedding, search, metadata, scores)
- [ ] Exit codes work correctly (0=PASS, 1=FAIL, 2=WARNING)
- [ ] All error messages are actionable (include "Suggested fix:")
- [ ] All functions have docstrings
- [ ] Happy path test passes (T017)
- [ ] Error scenario test passes (T018)
- [ ] Metadata validation test passes (T026, T027)
- [ ] Connection error tests pass (T032, T033, T034)

---

## Completion Criteria

**Definition of Done**:
1. Script runs without errors for any valid test query
2. All 6 validation checks execute successfully
3. Structured validation report displays clearly
4. Exit codes reflect validation outcome
5. Error messages are actionable for all failure modes
6. All 3 user stories independently testable and passing
7. Documentation complete (docstrings, .env.example, module docs)

**Deliverables**:
- ✅ `src/chatbot/backend/retrieve.py` (~250-300 lines)
- ✅ Updated `src/chatbot/backend/.env.example` (if needed)
- ✅ All 3 user stories validated

**Next Phase**: Use retrieve.py to validate retrieval pipeline before proceeding to query API implementation (Phase 1 of RAG Book Assistant)

---

## Task Summary

**Total Tasks**: 39
- Phase 1 (Setup): 4 tasks
- Phase 2 (User Story 1 - Developer): 14 tasks
- Phase 3 (User Story 2 - QA): 9 tasks
- Phase 4 (User Story 3 - DevOps): 7 tasks
- Phase 5 (Polish): 5 tasks

**Parallel Opportunities**: 11 tasks can run in parallel (marked with [P])

**Estimated Effort**:
- Setup: 30 minutes
- User Story 1: 2-3 hours
- User Story 2: 1-1.5 hours
- User Story 3: 1-1.5 hours
- Polish: 30 minutes
- **Total**: ~5-6 hours for experienced Python developer

**Dependencies**:
- External: Cohere API key, Qdrant cluster (same as Phase 0)
- Internal: Phase 0 ingestion complete (main.py), .env file configured

---

## User Story Completion Order

1. **User Story 1 (P0)**: Developer validates retrieval pipeline
   - **Blocks**: User Stories 2 & 3 (provides validation framework)
   - **Independent**: Yes (can be tested standalone)

2. **User Story 2 (P1)**: QA verifies data quality
   - **Depends on**: User Story 1 (validation framework)
   - **Independent**: Yes (can be tested standalone after US1)
   - **Parallel with**: User Story 3

3. **User Story 3 (P1)**: DevOps tests connection
   - **Depends on**: User Story 1 (connection validation framework)
   - **Independent**: Yes (can be tested standalone after US1)
   - **Parallel with**: User Story 2

**Critical Path**: Phase 1 → User Story 1 → (User Stories 2 & 3 in parallel) → Polish

---

## Implementation Notes

- **Single-file design**: All code in retrieve.py (~250-300 lines total)
- **No new dependencies**: Reuses Phase 0 dependencies (cohere, qdrant-client, python-dotenv, tenacity)
- **NamedTuples instead of Pydantic**: Lightweight type safety without external dependency
- **Read-only operations**: No writes to Qdrant, no collection modifications
- **CLI-only**: No web UI, no API endpoints
- **Exit codes**: 0 (PASS), 1 (FAIL), 2 (WARNING) for CI/CD integration
