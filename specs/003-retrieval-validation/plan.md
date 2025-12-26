# Implementation Plan: Retrieval & Pipeline Validation

**Branch**: `main` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-retrieval-validation/spec.md` and user implementation requirements

## Summary

Implement a standalone validation script (`retrieve.py`) that verifies the RAG retrieval pipeline works correctly after Phase 0 ingestion. The script connects to Qdrant, loads the existing 'rag_embeddings' collection, accepts test queries, performs top-k similarity search, and validates results for completeness, correctness, and metadata integrity. This is a read-only validation tool with no ingestion, embedding, or collection modification capabilities.

**Technical Approach**: Single Python file (`src/chatbot/backend/retrieve.py`) using existing dependencies (Cohere for query embeddings, Qdrant Client for search, python-dotenv for config). The script implements 6 validation checks (connection, collection config, embedding generation, search execution, metadata integrity, score validation) and outputs a structured PASS/FAIL report with actionable error messages.

## Technical Context

**Language/Version**: Python 3.11+ (same as Phase 0 ingestion)
**Primary Dependencies**:
- Cohere Python SDK (query embedding generation)
- Qdrant Client (vector search operations)
- python-dotenv (environment variable loading)
- argparse (CLI argument parsing)

**Storage**: Qdrant Cloud (read-only access to existing `rag_embeddings` collection)
**Testing**: Manual validation (script is self-testing), pytest for unit tests (optional)
**Target Platform**: Local development environment, CI/CD pipelines
**Project Type**: CLI validation tool (single-file script)
**Performance Goals**:
- Query embedding generation: <2 seconds
- Vector search execution: <1 second for top-10 results
- Total script execution: <5 seconds

**Constraints**:
- **Read-only operations**: No vector writes, no collection modifications, no re-embedding
- Single file implementation (`retrieve.py`) with no external modules
- Must use same embedding model as ingestion (embed-multilingual-v3.0)
- Must validate against existing collection (`rag_embeddings`) only
- CLI-only interface (no web UI, no API endpoints)

**Scale/Scope**:
- 301 existing chunks in Qdrant
- Top-k search limited to 5-10 results per query
- Single query per execution (no batch processing)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Principles Applied**:

✅ **Principle I: Accuracy through Primary Source Verification**
- Validation script verifies data integrity against source URLs stored in metadata
- Reports any missing or malformed source attribution
- No content generation or inference - only validation of existing data

✅ **Principle III: Reproducibility**
- Script runs on documented Python version (3.11+)
- Uses same dependencies as Phase 0 (already locked via UV)
- Environment variables documented in existing `.env.example`
- Validation results are deterministic for same query and collection state

✅ **Principle IV: Rigor**
- Uses production-grade Qdrant Client SDK (same as ingestion)
- Validates vector dimensionality and distance metrics
- Implements comprehensive error handling with actionable messages
- No experimental or unproven validation techniques

✅ **Principle V: Practicality & Inclusivity**
- No additional cost (uses existing Cohere/Qdrant free tiers)
- Runnable on student hardware (single query, no batch processing)
- Clear error messages for troubleshooting
- Works with existing UV environment setup

**Principle II: Clarity** - Not applicable (validation tool, not educational content)

**Constitution Compliance Status**: ✅ PASS - No violations detected

**Gates**:
- ✅ Single responsibility: Validation script has one job (validate retrieval pipeline)
- ✅ No state modification: Read-only operations only, explicit prohibition in spec
- ✅ Technology choices justified: Reuses existing dependencies, no new tools introduced
- ✅ Error handling: Comprehensive validation checks with clear failure messages

## Project Structure

### Documentation (this feature)

```text
specs/003-retrieval-validation/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (validation strategy, CLI design)
├── data-model.md        # Phase 1 output (validation entities, report structure)
├── quickstart.md        # Phase 1 output (usage guide, troubleshooting)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/chatbot/backend/
├── retrieve.py          # Validation script (THIS PLAN)
│                        # Functions: validate_connection(), validate_collection(),
│                        # generate_query_embedding(), perform_search(),
│                        # validate_results(), print_report(), main()
├── main.py              # Ingestion script (Phase 0 - already exists)
├── test_search.py       # Basic search test (Phase 0 - already exists, superseded by retrieve.py)
├── verify_ingestion.py  # Basic ingestion verification (Phase 0 - already exists)
├── .env                 # Environment variables (existing, reused)
├── .env.example         # Environment template (existing, may need updates)
├── pyproject.toml       # UV project config (existing, no new dependencies)
└── uv.lock              # Locked dependencies (existing)
```

**File Relationships**:
- `retrieve.py` depends on `.env` for Qdrant/Cohere credentials
- `retrieve.py` assumes `rag_embeddings` collection was created by `main.py`
- `retrieve.py` supersedes `test_search.py` with comprehensive validation

## Phase 0: Research & Unknowns

**Research Tasks** (to be documented in `research.md`):

### R1: CLI Argument Parsing Strategy
**Question**: How should the script accept test queries and configuration options?
**Options**:
- A) argparse with `--query`, `--top-k`, `--min-score` flags
- B) Hardcoded test queries with optional override via CLI
- C) Interactive prompt for query input

**Research**: Evaluate argparse patterns for single-purpose CLI tools, determine best UX for validation scripts

### R2: Validation Report Format
**Question**: What's the optimal output format for structured validation reports?
**Options**:
- A) Plain text with colored output (using colorama/rich)
- B) Structured JSON for CI/CD parsing
- C) Markdown table format for documentation
- D) Plain text only (no dependencies)

**Research**: Survey validation tool output formats (pytest, linters, health checks), decide on PASS/FAIL presentation

### R3: Error Handling Strategy
**Question**: How should validation failures be communicated and handled?
**Options**:
- A) Exit codes (0=PASS, 1=FAIL, 2=WARNING) with detailed stderr output
- B) Exception-based with try-except hierarchy
- C) Validation accumulator pattern (collect all failures, report at end)

**Research**: Best practices for validation scripts in CI/CD pipelines, determine actionable error message structure

### R4: Metadata Validation Rules
**Question**: Which metadata fields are required vs. optional, and what constitutes a validation failure?
**Spec requirement**: "100% of retrieved chunks contain complete metadata (text, source URL, chapter, section)"
**Options**:
- A) FAIL if any required field missing (text, source_url), WARNING if optional field missing (section)
- B) FAIL only if text or source_url missing, ignore other fields
- C) Configurable strictness levels

**Research**: Review Phase 0 ingestion metadata extraction logic, define validation criteria that catch real issues

### R5: Query Embedding Generation
**Question**: Should the script handle embedding errors differently than search errors?
**Considerations**:
- Cohere API rate limits
- Network timeouts
- Invalid query formats

**Research**: Cohere API error codes and retry strategies, decide on graceful degradation approach

**Unknowns to Resolve**:
1. **CLI UX**: Determine argument parsing strategy (R1)
2. **Output Format**: Choose validation report presentation (R2)
3. **Error Handling**: Define failure modes and exit codes (R3)
4. **Validation Rules**: Specify metadata completeness criteria (R4)
5. **Retry Logic**: Decide on embedding error handling (R5)

## Phase 1: Design Decisions

**Artifacts to Generate**:
1. `research.md`: Document decisions for R1-R5
2. `data-model.md`: Define ValidationReport, ValidationCheck, RetrievedChunk entities
3. `quickstart.md`: Usage guide with examples and troubleshooting

### Design Decision 1: Single-File Architecture

**Rationale**: Validation script is a standalone tool with ~200-300 lines of code. No need for modules or complex structure. Follows same pattern as Phase 0 `main.py`.

**Trade-offs**:
- ✅ Easy to distribute and run (single file)
- ✅ No import complexity or module dependencies
- ⚠️ Cannot easily unit test individual validation functions
- ⚠️ May need refactoring if validation logic grows significantly

**Decision**: Acceptable trade-off for MVP validation tool. Refactor to multi-file if script exceeds 500 lines or validation functions become reusable across projects.

### Design Decision 2: Dependency Reuse

**Rationale**: Use existing Phase 0 dependencies (Cohere, Qdrant Client, python-dotenv) without adding new libraries. This minimizes setup overhead and ensures compatibility.

**Dependencies NOT Added**:
- ❌ colorama/rich (colored output): Not essential, adds dependency
- ❌ pydantic (validation models): Overkill for simple validation script
- ❌ click/typer (CLI frameworks): argparse is sufficient
- ❌ pytest (testing): Manual validation is enough for MVP

**Decision**: Stick with stdlib argparse and plain text output. Add fancy formatting only if user feedback requests it.

### Design Decision 3: Validation vs. Testing

**Distinction**:
- **Validation**: Checks production data quality (metadata completeness, score ranges, URL formats)
- **Testing**: Verifies code behavior (unit tests, integration tests)

**This script is validation**, not testing. It operates on real production data (Qdrant collection) and reports data quality issues, not code bugs.

**Implications**:
- No mocking or fixtures
- No assertions (uses validation checks instead)
- Results depend on collection state (not deterministic across different Qdrant instances)

### Design Decision 4: Read-Only Guarantee

**Implementation Strategy**:
- Use Qdrant Client read operations only: `get_collection()`, `scroll()`, `query_points()`
- No calls to: `upsert()`, `delete()`, `create_collection()`, `update_collection()`
- Document prohibited operations in docstrings
- Add defensive checks (e.g., verify no write methods called)

**Verification**: Code review checklist to confirm no write operations present

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                     retrieve.py (CLI Script)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Connection Validation                               │
│  - Load .env variables                                       │
│  - Connect to Qdrant                                         │
│  - Verify collection exists                                  │
│  - Check collection config (1024-dim, cosine)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Query Embedding Generation                          │
│  - Parse CLI query argument                                  │
│  - Generate embedding via Cohere                             │
│  - Validate embedding dimensions (1024)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Similarity Search Execution                         │
│  - Perform top-k search (default k=5)                        │
│  - Retrieve results with metadata                            │
│  - Validate non-empty results                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: Result Validation                                   │
│  - Check metadata completeness (text, source_url, etc.)      │
│  - Validate similarity scores (0.0-1.0 range)                │
│  - Verify ranking order (descending scores)                  │
│  - Validate URL formats                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: Report Generation                                   │
│  - Print validation summary (PASS/FAIL/WARNING)              │
│  - Display results with scores, metadata, sources            │
│  - Output actionable error messages                          │
│  - Exit with appropriate code (0=PASS, 1=FAIL, 2=WARNING)    │
└─────────────────────────────────────────────────────────────┘
```

## Execution Flow

1. **Parse CLI arguments**: Extract query, top-k, min-score from `argparse`
2. **Load environment**: Read QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY from `.env`
3. **Validate connection**: Connect to Qdrant, verify collection exists
4. **Check collection config**: Validate vector size=1024, distance=cosine
5. **Generate query embedding**: Call Cohere API with input_type="search_query"
6. **Perform search**: Execute `query_points()` with query embedding
7. **Validate results**:
   - Check non-empty results (WARNING if 0 results, not FAIL)
   - Verify metadata completeness for each chunk
   - Validate similarity scores in range [0.0, 1.0]
   - Confirm descending score order
   - Check source URL format (must start with textbook domain)
8. **Print report**:
   - Header: Query, Results count, Overall status
   - Body: For each result, print score, chapter, section, text preview, source URL
   - Footer: Validation checks summary (e.g., "6/6 checks passed")
9. **Exit with code**: 0 if PASS, 1 if FAIL, 2 if WARNING

## Function Breakdown

### `main()`
**Purpose**: Entry point for CLI script
**Responsibilities**:
- Parse command-line arguments
- Orchestrate validation workflow (connection → embedding → search → validation → report)
- Handle top-level exceptions
- Exit with appropriate code

### `validate_connection() -> tuple[QdrantClient, dict]`
**Purpose**: Verify Qdrant connection and collection existence
**Returns**: (client, collection_info)
**Validation Checks**:
- Environment variables present (QDRANT_URL, QDRANT_API_KEY)
- Qdrant connection succeeds
- Collection 'rag_embeddings' exists
**Error Handling**: Raise with actionable message if check fails

### `validate_collection_config(collection_info: dict) -> None`
**Purpose**: Verify collection schema matches expected configuration
**Validation Checks**:
- Vector size == 1024
- Distance metric == cosine
**Error Handling**: Raise if mismatch detected

### `generate_query_embedding(query: str, cohere_client: cohere.Client) -> list[float]`
**Purpose**: Generate query embedding using Cohere
**Parameters**: query text, Cohere client
**Returns**: 1024-dim embedding vector
**Validation Checks**:
- COHERE_API_KEY environment variable present
- Cohere API call succeeds
- Embedding dimensions == 1024
**Error Handling**: Retry once on transient failures, raise on persistent errors

### `perform_search(client: QdrantClient, query_embedding: list[float], top_k: int) -> list`
**Purpose**: Execute vector similarity search
**Parameters**: Qdrant client, query embedding, top-k value
**Returns**: List of search results (points)
**Validation Checks**:
- Search completes without errors
**Error Handling**: Raise on Qdrant errors with network/timeout details

### `validate_results(results: list, min_score: float) -> list[ValidationCheck]`
**Purpose**: Validate search results for metadata and score correctness
**Parameters**: Search results, minimum score threshold
**Returns**: List of ValidationCheck objects (check_name, status, message)
**Validation Checks**:
- Non-empty results (WARNING if empty, not FAIL)
- Each result has required fields: text (non-empty), source_url (well-formed)
- Each result has optional fields: chapter, section (WARNING if missing)
- Similarity scores in range [0.0, 1.0]
- Results ordered by descending score
- Source URLs match expected domain (WARNING if mismatch)
**Error Handling**: Accumulate failures, return all checks

### `print_report(query: str, results: list, checks: list[ValidationCheck]) -> None`
**Purpose**: Print structured validation report
**Output Format**:
```
============================================================
RETRIEVAL VALIDATION REPORT
============================================================
Query: "What are vector databases?"
Results: 5 chunks retrieved

------------------------------------------------------------
Result 1 (score: 0.523):
  Chapter: Chapter 10: Vision-Language-Action (VLA) Models
  Section: Vector Database Fundamentals
  Source: https://shumailaaijaz.github.io/physical-ai-textbook/docs/10-vision-language-action
  Text: Vector databases store high-dimensional embeddings...

Result 2 (score: 0.498):
  ...

------------------------------------------------------------
VALIDATION CHECKS
------------------------------------------------------------
✅ Connection: PASS
✅ Collection Config: PASS (1024-dim, cosine)
✅ Query Embedding: PASS (1024 dimensions)
✅ Search Execution: PASS (5 results)
✅ Metadata Completeness: PASS (5/5 chunks complete)
✅ Score Validation: PASS (range: 0.498-0.523, descending order)

============================================================
OVERALL STATUS: PASS
============================================================
```

**Exit Code**: Determined by overall status (PASS=0, FAIL=1, WARNING=2)

## Error Scenarios

### Scenario 1: Missing Environment Variables
**Error**: `QDRANT_URL` not set
**Output**:
```
❌ FAIL: Missing required environment variable QDRANT_URL
Suggested fix: Add QDRANT_URL to .env file (see .env.example)
```
**Exit Code**: 1

### Scenario 2: Collection Not Found
**Error**: `rag_embeddings` collection doesn't exist
**Output**:
```
❌ FAIL: Collection 'rag_embeddings' not found in Qdrant
Suggested fix: Run ingestion script (uv run main.py) to create collection
```
**Exit Code**: 1

### Scenario 3: Dimension Mismatch
**Error**: Query embedding is 768-dim instead of 1024-dim
**Output**:
```
❌ FAIL: Query embedding dimension mismatch
Expected: 1024 dimensions (Cohere embed-multilingual-v3.0)
Got: 768 dimensions
Suggested fix: Check COHERE_API_KEY is using correct model
```
**Exit Code**: 1

### Scenario 4: Missing Metadata
**Error**: Chunk has no `source_url` field
**Output**:
```
❌ FAIL: Metadata validation failed
Chunk ID abc123 missing required field 'source_url'
Affected: 1/5 chunks
Suggested fix: Re-run ingestion (uv run main.py) to fix metadata
```
**Exit Code**: 1

### Scenario 5: Empty Results (Not a Failure)
**Error**: Query returns 0 results
**Output**:
```
⚠️  WARNING: No results found for query "quantum computing in robotics"
This may indicate query is outside textbook scope
Validation checks still passing (connection, collection config OK)
```
**Exit Code**: 2 (WARNING, not FAIL)

## Dependencies

**Existing** (from Phase 0):
- `cohere>=5.0.0` - Query embedding generation
- `qdrant-client>=1.7.0` - Vector search operations
- `python-dotenv>=1.0.0` - Environment variable loading

**New** (stdlib only, no external dependencies):
- `argparse` (stdlib) - CLI argument parsing
- `sys` (stdlib) - Exit codes
- `os` (stdlib) - Environment variable access

**NOT Adding**:
- ❌ colorama/rich - Colored output (nice-to-have, not essential)
- ❌ pydantic - Validation models (overkill for this use case)
- ❌ click/typer - CLI frameworks (argparse sufficient)

## Risks & Mitigations

### Risk 1: Cohere API Rate Limiting
**Impact**: Medium (validation fails if embedding generation rate-limited)
**Probability**: Low (single query per run, low volume)
**Mitigation**: Implement retry logic with exponential backoff (1 retry max for validation script)

### Risk 2: Network Instability
**Impact**: Medium (validation fails on network errors)
**Probability**: Medium (Qdrant Cloud dependency)
**Mitigation**: Clear error messages with network troubleshooting steps, suggest retry

### Risk 3: Stale Collection Data
**Impact**: Low (validation passes but collection has outdated content)
**Probability**: Medium (if ingestion not re-run after textbook updates)
**Mitigation**: Document when to re-run ingestion in `quickstart.md`, add collection timestamp check (optional)

### Risk 4: False Negatives (PASS when should FAIL)
**Impact**: High (defeats purpose of validation)
**Probability**: Low (comprehensive validation checks designed)
**Mitigation**: Thorough testing of validation logic, peer review of check criteria

### Risk 5: False Positives (FAIL when should PASS)
**Impact**: Medium (blocks workflow unnecessarily)
**Probability**: Medium (overly strict validation rules)
**Mitigation**: Distinguish required vs. optional metadata fields, use WARNING status appropriately

## Next Steps

After `/sp.plan` completes:

1. **Generate `research.md`**: Document decisions for R1-R5 (CLI parsing, output format, error handling, validation rules, retry logic)
2. **Generate `data-model.md`**: Define ValidationReport, ValidationCheck, RetrievedChunk entities with attributes
3. **Generate `quickstart.md`**: Write usage guide with examples, troubleshooting, and common error resolutions
4. **Run `/sp.tasks`**: Generate implementation task list for `retrieve.py`
5. **Run `/sp.implement`**: Execute task list to create validation script

**Estimated Complexity**: Low-Medium (single-file script, ~200-300 lines, reuses existing dependencies)
