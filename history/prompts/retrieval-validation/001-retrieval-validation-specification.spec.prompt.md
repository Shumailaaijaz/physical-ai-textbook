---
id: 001
title: Retrieval & Pipeline Validation Specification
stage: spec
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: retrieval-validation
branch: main
user: developer
command: /sp.specify
labels: ["spec", "retrieval", "validation", "qdrant", "pipeline-testing"]
links:
  spec: specs/003-retrieval-validation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-retrieval-validation/spec.md
  - specs/003-retrieval-validation/checklists/requirements.md
tests:
  - Specification quality checklist validation (16/16 items passed)
  - All mandatory sections completed
  - No implementation details in spec
  - All requirements are testable
---

## Prompt

Retrieval & Pipeline Validation
Role

You are a retrieval and pipeline-validation agent responsible for verifying that the RAG retrieval layer functions correctly using already-ingested data.

You must validate Qdrant connectivity, vector search correctness, and metadata integrity.

You do not perform ingestion, extraction, or embedding of documents.

System Context

The system already contains:

Extracted and chunked website/book data

Embeddings generated using Cohere embedding models

Vectors stored in Qdrant

Backend implemented in FastAPI

Metadata persisted in Neon Serverless PostgreSQL

This specification assumes the vector database is already populated.

SPEC2 REQUIREMENTS (MANDATORY)
Retrieval & Pipeline Validation

You must:

Create a single Python file:

backend/retrieve.py


Inside retrieve.py:

Connect to Qdrant

Load existing vector collections

Accept a test query

Perform top-k similarity search

Validate returned results using:

Retrieved text

Metadata

Source URLs

Implementation Responsibilities
Qdrant Connection

Use Qdrant client SDK

Read Qdrant connection details from environment variables

Confirm the target collection exists before querying

Retrieval Procedure

Accept a test query (CLI argument or hardcoded test input)

Generate a query embedding using Cohere

input_type = "search_query"

Perform similarity search against the existing Qdrant collection

Retrieve top-k results (k = 5–10)

Return:

Raw chunk text

Similarity score

Metadata (URL, chapter, section)

Do not alter or summarize retrieved content.

Validation Checks (REQUIRED)

retrieve.py must validate:

Qdrant connection success

Collection availability

Vector dimensionality compatibility

Non-empty retrieval results

Correct ranking by similarity score

Presence and correctness of:

Text

Metadata

Source URLs

Failure Handling

If any validation fails, output:

The exact failure stage

Technical reason

Suggested fix (e.g., missing collection, wrong embedding size)

No silent failures are allowed.

Output Requirements

retrieve.py must print a clear, structured validation report, including:

Query used

Number of results returned

Top results with:

Text preview

Score

Source URL

Validation status (PASS / FAIL)

Prohibitions

Do not re-embed stored documents

Do not write new vectors

Do not modify existing collections

Do not generate answers for users

Do not hallucinate missing data

Success Criteria

SPEC2 is complete when:

backend/retrieve.py runs without errors

Qdrant collections load successfully

Relevant chunks are retrieved for test queries

Metadata and source URLs are correctly returned

Validation checks pass consistently

Final Instruction

Operate strictly as a retrieval and pipeline-validation agent.
Your output must demonstrate that the retrieval pipeline is correct, stable, and production-ready.

## Response snapshot

Created comprehensive specification for Retrieval & Pipeline Validation feature.

**Specification Scope**:
- **Purpose**: Validate RAG retrieval pipeline after Phase 0 ingestion completion
- **Role**: Read-only validation tool (no ingestion, embedding, or collection modification)
- **Context**: Works with existing 301 chunks in Qdrant collection 'rag_embeddings'

**Key Design Decisions**:

1. **CLI-Only Validation Tool**: Not a web API or interactive UI - single Python script for developer/QA/DevOps validation
2. **Read-Only Operations**: Explicit prohibition against modifying vectors, collections, or re-embedding documents
3. **Structured Validation Reporting**: Clear PASS/FAIL/WARNING status for each check with actionable error messages
4. **Single File Implementation**: backend/retrieve.py as standalone validation script (aligns with Phase 0 single-file pattern)

**User Stories** (3 total):
1. **Developer Validates Retrieval Pipeline** (P0): Run validation script with test query, verify search works correctly
2. **QA Engineer Verifies Data Quality** (P1): Validate metadata completeness and correctness
3. **DevOps Engineer Tests Connection Reliability** (P1): Verify Qdrant connection and configuration

**Functional Requirements** (11 total):
- FR-001: Query input handling (CLI argument with fallback)
- FR-002: Environment configuration (QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY)
- FR-003: Qdrant connection validation
- FR-004: Collection configuration verification (1024-dim, cosine)
- FR-005: Query embedding generation (Cohere search_query)
- FR-006: Similarity search execution (top-k, default 5-10)
- FR-007: Result metadata validation (text, source_url, chapter, section)
- FR-008: Score validation (0.0-1.0 range, descending order)
- FR-009: Structured validation report output
- FR-010: Error handling with actionable messages
- FR-011: Non-modification guarantee (read-only)

**Success Criteria** (7 measurable outcomes):
1. Validation tool executes successfully for any valid query
2. Relevant results returned with similarity scores above 0.4
3. 100% of retrieved chunks contain complete metadata
4. Qdrant connection succeeds consistently
5. Vector compatibility validated (1024-dim, cosine)
6. Results ordered by descending similarity score
7. Clear validation reporting with PASS/FAIL status

**Edge Cases Covered** (5 scenarios):
- Query language mismatch (Urdu query on English chunks)
- Extremely long queries (>512 tokens)
- Empty collection (0 points)
- Partial metadata (missing optional fields)
- Network timeout during search

**Key Entities Defined**:
- QueryRequest (query_text, top_k, min_score)
- QueryEmbedding (vector, model, input_type)
- RetrievedChunk (chunk_id, text, similarity_score, source_url, chapter, section, chunk_index)
- ValidationReport (query, results_count, checks, overall_status)
- ValidationCheck (check_name, status, message, affected_items)

**Out of Scope** (10 items):
- Re-ingestion, collection creation, answer generation
- Interactive UI, performance benchmarking, multi-collection support
- Custom embedding models, result re-ranking, batch queries
- Automated test suite for CI/CD

**Clarifications Made Without User Input** (informed guesses):
1. **Top-k value**: Defaulted to 5-10 (standard for retrieval validation)
2. **Minimum score threshold**: Defaulted to 0.0 (configurable, but no filtering by default)
3. **Retry logic**: One retry on network timeout (total 2 attempts)
4. **Query truncation**: 512 tokens max (Cohere's limit)
5. **CLI argument format**: `--query "text"` with fallback to hardcoded test queries
6. **Validation report format**: Structured text output (not JSON, not CSV)

**No [NEEDS CLARIFICATION] markers** - all requirements clear and testable.

## Outcome

- ✅ **Impact**: Complete, production-ready specification for retrieval validation; all quality checks passed; ready for `/sp.plan` without needing `/sp.clarify`
- 🧪 **Tests**: Specification quality checklist passed (16/16 items); no implementation details; all requirements testable; success criteria measurable
- 📁 **Files**:
  - specs/003-retrieval-validation/spec.md (comprehensive specification)
  - specs/003-retrieval-validation/checklists/requirements.md (validation checklist with PASS results)
- 🔁 **Next prompts**:
  1. Proceed directly to planning: `/sp.plan` (no clarifications needed)
  2. Or generate tasks: `/sp.tasks` (if planning can be skipped for simple validation script)
- 🧠 **Reflection**: User requested working on spec directly without branch creation (said "work on spec right now create specification"). Interpreted the lengthy prompt as detailed requirements for a retrieval validation tool, not as implementation instructions. Successfully distinguished between WHAT (validation capabilities) and HOW (Python implementation details). The original prompt mentioned "Backend implemented in FastAPI" and "Metadata persisted in Neon Serverless PostgreSQL" - clarified in Notes section that these refer to future Phase 1 query API, not this CLI validation script. All 7 success criteria are measurable and technology-agnostic as required.

## Evaluation notes (flywheel)

- **Failure modes observed**: None; specification passed all quality checks on first iteration
- **Graders run and results (PASS/FAIL)**:
  - Content Quality - PASS (4/4 items)
  - Requirement Completeness - PASS (8/8 items)
  - Feature Readiness - PASS (4/4 items)
  - Total: 16/16 validation items passed
- **Prompt variant (if applicable)**: User requested immediate spec creation without branch workflow ("work on spec right now")
- **Next experiment (smallest change to try)**: For next specification, test whether incorporating example validation report format in spec improves clarity of output requirements (FR-009)
