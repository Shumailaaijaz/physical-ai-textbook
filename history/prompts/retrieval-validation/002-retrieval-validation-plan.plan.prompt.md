---
id: 002
title: Retrieval Validation Implementation Plan
stage: plan
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: retrieval-validation
branch: main
user: developer
command: /sp.plan
labels: ["plan", "retrieval", "validation", "architecture", "design-decisions"]
links:
  spec: specs/003-retrieval-validation/spec.md
  plan: specs/003-retrieval-validation/plan.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-retrieval-validation/plan.md
  - specs/003-retrieval-validation/research.md
  - specs/003-retrieval-validation/data-model.md
  - specs/003-retrieval-validation/quickstart.md
tests:
  - Constitution Check validation (5/5 principles passed)
  - All Phase 0 research questions resolved (R1-R5)
  - Data model entities defined (5 entities)
  - Quickstart guide completed with troubleshooting
---

## Prompt

Retrieval and pipeline validation create a single file "retrieve.py" in the backend folder
connect to Qdrant and load existing vector collections
Accept a test query and perform top-k similarity search
validate results using returned text, metadata, and source URLs

## Response snapshot

Created comprehensive implementation plan for Retrieval & Pipeline Validation feature.

**Planning Artifacts Generated**:

1. **plan.md**: Technical architecture and implementation strategy
   - Single-file design (retrieve.py, ~200-300 lines)
   - Read-only validation workflow (no writes, no modifications)
   - 6 validation checks (connection, collection config, embedding, search, metadata, scores)
   - Exit code strategy (0=PASS, 1=FAIL, 2=WARNING)
   - Function breakdown (7 functions: main, validate_connection, validate_collection_config, generate_query_embedding, perform_search, validate_results, print_report)

2. **research.md**: Resolved 5 research questions
   - **R1 - CLI Parsing**: argparse with optional --query, --top-k, --min-score flags
   - **R2 - Report Format**: Plain text with Unicode symbols (✅/❌/⚠️), no external dependencies
   - **R3 - Error Handling**: Validation accumulator pattern with actionable error messages
   - **R4 - Metadata Rules**: Required (text, source_url) vs. Optional (chapter, section)
   - **R5 - Retry Logic**: 1 retry for transient failures, distinct error messages for embedding vs. search

3. **data-model.md**: Defined 5 key entities
   - **QueryRequest** (query_text, top_k, min_score) - CLI input
   - **QueryEmbedding** (vector, model, input_type) - Cohere API response
   - **RetrievedChunk** (chunk_id, text, similarity_score, source_url, chapter, section, chunk_index, token_count) - Qdrant result
   - **ValidationCheck** (check_name, status, message, affected_items) - Individual check result
   - **ValidationReport** (query, results_count, checks, overall_status, top_results) - Aggregated report

4. **quickstart.md**: Complete usage guide
   - Installation and configuration steps
   - Basic usage examples
   - Advanced usage (custom queries, top-k, min-score)
   - Output interpretation guide
   - Troubleshooting (9 common errors with solutions)
   - CI/CD integration example (GitHub Actions)
   - Best practices

**Technical Decisions**:

1. **Single-File Architecture**: All logic in retrieve.py (~200-300 lines)
   - Rationale: Simple validation tool, no need for modules
   - Trade-off: Harder to unit test, but acceptable for MVP

2. **Dependency Reuse**: No new dependencies beyond Phase 0
   - Uses: cohere, qdrant-client, python-dotenv, argparse (stdlib)
   - Not adding: colorama/rich, pydantic, click/typer

3. **Read-Only Guarantee**: Only uses Qdrant read operations
   - Methods: get_collection(), scroll(), query_points()
   - Prohibited: upsert(), delete(), create_collection()

4. **Validation vs. Testing**: This is validation (data quality), not testing (code behavior)
   - No mocking, no fixtures, no assertions
   - Results depend on collection state

**Constitution Check** (✅ PASS):
- ✅ Principle I (Accuracy): Verifies data integrity against source URLs
- ✅ Principle III (Reproducibility): Uses same dependencies as Phase 0, documented environment
- ✅ Principle IV (Rigor): Production-grade SDK, comprehensive error handling
- ✅ Principle V (Practicality): No additional cost, runs on student hardware

**Architecture**:
```
retrieve.py (CLI Script)
  ↓
Phase 1: Connection Validation (load .env, connect to Qdrant, verify collection)
  ↓
Phase 2: Query Embedding (parse CLI, generate embedding via Cohere, validate dimensions)
  ↓
Phase 3: Search Execution (perform top-k search, retrieve metadata, validate non-empty)
  ↓
Phase 4: Result Validation (check metadata, validate scores, verify ranking)
  ↓
Phase 5: Report Generation (print summary, display results, exit with code)
```

**Validation Checks**:
1. Connection (Qdrant connection, collection exists)
2. Collection Config (1024-dim, cosine)
3. Query Embedding (1024 dimensions)
4. Search Execution (results returned)
5. Metadata Completeness (text, source_url present)
6. Score Validation (0.0-1.0 range, descending order)

**Error Scenarios Documented** (6 errors + 2 warnings):
- Missing environment variables
- Collection not found
- Dimension mismatch
- Missing metadata
- Empty results (WARNING, not FAIL)
- Missing optional metadata (WARNING)

**Risks Identified**:
1. Cohere API rate limiting (Low probability, 1 retry mitigation)
2. Network instability (Medium probability, clear error messages)
3. Stale collection data (Medium probability, document re-ingestion)
4. False negatives (Low probability, thorough testing)
5. False positives (Medium probability, distinguish required vs. optional)

**Next Steps Documented**:
1. Generate tasks.md via `/sp.tasks`
2. Implement retrieve.py via `/sp.implement`
3. Test validation with diverse queries
4. Integrate into CI/CD pipeline

## Outcome

- ✅ **Impact**: Complete implementation plan ready for task generation and implementation; all unknowns resolved; comprehensive quickstart guide
- 🧪 **Tests**: Constitution check passed (5/5 principles); 5 research questions resolved; data model validated; quickstart covers 9 common errors
- 📁 **Files**:
  - plan.md (comprehensive architecture and execution flow)
  - research.md (R1-R5 decisions documented)
  - data-model.md (5 entities with NamedTuple implementation)
  - quickstart.md (usage guide with troubleshooting and CI/CD)
- 🔁 **Next prompts**:
  1. Generate tasks: `/sp.tasks` (create task list for retrieve.py implementation)
  2. Or proceed directly: `/sp.implement` (if simple enough to skip task generation)
- 🧠 **Reflection**: User requested "single file retrieve.py" aligned perfectly with Phase 0 single-file pattern (main.py). Successfully distinguished validation (data quality) from testing (code behavior). Research decisions prioritized simplicity (no new dependencies, plain text output, stdlib argparse) over fancy features (colorama, pydantic, click). The validation accumulator pattern ensures comprehensive error reporting vs. fail-fast. Exit code strategy (0/1/2) enables CI/CD integration. Quickstart guide preemptively addresses 9 common errors with actionable solutions, reducing support burden.

## Evaluation notes (flywheel)

- **Failure modes observed**: None; all planning phases completed successfully
- **Graders run and results (PASS/FAIL)**:
  - Constitution Check - PASS (5/5 principles applied, no violations)
  - Research Completeness - PASS (5/5 questions resolved with clear decisions)
  - Data Model Clarity - PASS (5 entities defined with attributes and validation rules)
  - Quickstart Usability - PASS (covers installation, usage, troubleshooting, CI/CD)
- **Prompt variant (if applicable)**: User provided concise implementation requirements; expanded into full planning workflow (Phase 0 research, Phase 1 design)
- **Next experiment (smallest change to try)**: For next planning phase, test whether including sample code snippets in plan.md (vs. just pseudocode) improves task generation accuracy
