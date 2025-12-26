# Specification: Retrieval & Pipeline Validation

**Feature ID**: 003
**Status**: Draft
**Created**: 2025-12-25
**Owner**: Development Team

## Overview

### Purpose

Validate that the RAG (Retrieval-Augmented Generation) retrieval pipeline functions correctly after content ingestion. This feature ensures the vector search, metadata integrity, and Qdrant connectivity are production-ready without performing any new ingestion, extraction, or embedding operations.

### Background

The system has already completed Phase 0 (Content Ingestion) with:
- 301 text chunks from 13 chapters of the Physical AI textbook
- Embeddings generated using Cohere's embed-multilingual-v3.0 model (1024 dimensions)
- Vectors stored in Qdrant collection 'rag_embeddings'
- Metadata preserved (chapter, section, source URL)

Before building the query API (Phase 1), we need a standalone validation tool to verify the retrieval layer works correctly, returns relevant results, and maintains data integrity.

### Success Criteria

1. **Validation tool executes successfully** - Retrieval script runs without errors for any valid test query
2. **Relevant results returned** - Top-k search returns contextually appropriate chunks with similarity scores above 0.4
3. **Metadata integrity confirmed** - 100% of retrieved chunks contain complete metadata (text, source URL, chapter, section)
4. **Connection reliability verified** - Qdrant connection succeeds consistently across multiple test runs
5. **Vector compatibility validated** - Query embeddings match collection dimensionality (1024-dim) and distance metric (cosine)
6. **Ranking correctness confirmed** - Results are ordered by descending similarity score
7. **Clear validation reporting** - Each test produces a structured report showing query, results, scores, sources, and pass/fail status

## User Stories

### Story 1: Developer Validates Retrieval Pipeline (Priority: P0 - Critical)

**As a** backend developer
**I want to** run a validation script that tests the retrieval pipeline
**So that** I can confirm the vector search works correctly before building the query API

**Acceptance Criteria**:
- Script accepts a test query as input (CLI argument or hardcoded)
- Connects to Qdrant and validates collection exists
- Generates query embedding using Cohere
- Performs top-k similarity search (k=5-10)
- Returns results with text, similarity scores, and metadata
- Prints a structured validation report showing pass/fail status
- Fails gracefully with actionable error messages if any validation check fails

**Test Scenarios**:
1. **Happy path**: Run with query "What is reinforcement learning?" → Returns 5-10 relevant chunks with scores, metadata, and source URLs
2. **Collection missing**: Run when Qdrant collection doesn't exist → Reports "FAIL: Collection 'rag_embeddings' not found" with suggestion to run ingestion
3. **Dimension mismatch**: Simulate wrong embedding size → Reports "FAIL: Query embedding (X-dim) doesn't match collection (1024-dim)"
4. **Empty results**: Run query with no matching content → Reports "WARNING: No results found" but doesn't fail validation
5. **Metadata missing**: Detect chunk without source URL → Reports "FAIL: Missing metadata in chunk ID X"

### Story 2: QA Engineer Verifies Data Quality (Priority: P1 - High)

**As a** QA engineer
**I want to** validate that retrieved chunks contain complete and correct metadata
**So that** I can ensure the query API will have proper source attribution

**Acceptance Criteria**:
- Validation script checks each retrieved chunk for required fields (text, source_url, chapter, section)
- Reports any missing or malformed metadata with specific chunk IDs
- Validates that source URLs are well-formed and match expected domain
- Confirms similarity scores are in valid range (0.0-1.0)
- Validates results are ordered by descending similarity score

**Test Scenarios**:
1. **Complete metadata**: All chunks have text + source_url + chapter + section → Reports "PASS: All metadata present"
2. **Missing chapter**: One chunk has no chapter field → Reports "FAIL: Chunk ID X missing 'chapter' field"
3. **Invalid score**: Similarity score outside 0-1 range → Reports "FAIL: Invalid score Y for chunk ID X"
4. **Wrong URL domain**: Source URL doesn't match textbook domain → Reports "WARNING: Unexpected domain in chunk ID X"

### Story 3: DevOps Engineer Tests Connection Reliability (Priority: P1 - High)

**As a** DevOps engineer
**I want to** verify Qdrant connection stability and configuration
**So that** I can ensure the production environment is correctly set up

**Acceptance Criteria**:
- Script reads Qdrant connection details from environment variables (QDRANT_URL, QDRANT_API_KEY)
- Validates connection before attempting queries
- Confirms target collection 'rag_embeddings' exists
- Checks collection configuration (vector size: 1024, distance: cosine)
- Reports connection status and collection statistics (total points)
- Fails fast with clear error message if connection fails

**Test Scenarios**:
1. **Valid connection**: Credentials correct → Reports "PASS: Connected to Qdrant, collection has 301 points"
2. **Invalid credentials**: Wrong API key → Reports "FAIL: Authentication failed - check QDRANT_API_KEY"
3. **Network unavailable**: Qdrant unreachable → Reports "FAIL: Connection timeout - check QDRANT_URL and network"
4. **Wrong collection config**: Vector size not 1024 → Reports "FAIL: Collection vector size mismatch (expected 1024, found X)"

## Functional Requirements

### FR-001: Query Input Handling
The validation script must accept test queries via CLI argument with fallback to default test queries if no input provided.

### FR-002: Environment Configuration
The script must read Qdrant connection details (QDRANT_URL, QDRANT_API_KEY) and Cohere API key (COHERE_API_KEY) from environment variables.

### FR-003: Qdrant Connection Validation
The script must validate Qdrant connection and confirm collection 'rag_embeddings' exists before performing queries.

### FR-004: Collection Configuration Verification
The script must verify collection settings match expected values (vector size: 1024, distance: cosine).

### FR-005: Query Embedding Generation
The script must generate query embeddings using Cohere's embed-multilingual-v3.0 model with input_type="search_query".

### FR-006: Similarity Search Execution
The script must perform top-k vector similarity search with configurable k value (default: 5-10).

### FR-007: Result Metadata Validation
The script must validate each retrieved chunk contains required fields: text (non-empty), source_url (well-formed URL), chapter (present), section (present).

### FR-008: Score Validation
The script must confirm similarity scores are in valid range (0.0-1.0) and results are ordered by descending score.

### FR-009: Structured Validation Report
The script must output a clear report containing:
- Query used
- Number of results returned
- For each result: text preview (first 200 chars), similarity score, chapter, section, source URL
- Validation status (PASS/FAIL) for each check
- Summary of all validation checks

### FR-010: Error Handling
The script must fail gracefully with actionable error messages for:
- Missing environment variables
- Qdrant connection failures
- Collection not found
- Embedding API failures
- Dimension mismatches
- Missing metadata

### FR-011: Non-Modification Guarantee
The script must operate in read-only mode - no vectors written, no collections modified, no documents re-embedded.

## User Scenarios & Testing

### Scenario 1: First-Time Validation After Ingestion

**User**: Backend developer
**Goal**: Confirm retrieval works after completing Phase 0 ingestion

**Steps**:
1. Developer completes ingestion pipeline (main.py)
2. Developer sets environment variables (QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY)
3. Developer runs: `uv run retrieve.py --query "What are vector databases?"`
4. Script validates connection, performs search, displays results
5. Developer reviews validation report

**Expected Outcome**:
- Script connects successfully
- Returns 5-10 relevant chunks about vector databases
- All chunks have complete metadata
- Similarity scores between 0.4-0.6
- Validation report shows "PASS" for all checks

### Scenario 2: Debugging Empty Results

**User**: QA engineer
**Goal**: Understand why a specific query returns no results

**Steps**:
1. QA runs: `uv run retrieve.py --query "quantum computing in robotics"`
2. Script performs search, returns 0 results
3. Script reports "WARNING: No results found - query may be outside textbook scope"
4. QA adjusts query to match textbook content

**Expected Outcome**:
- Script doesn't fail (WARNING, not FAIL)
- Clear message about why results are empty
- Validation checks still pass (connection, collection config)

### Scenario 3: Production Readiness Check

**User**: DevOps engineer
**Goal**: Verify production Qdrant cluster is correctly configured

**Steps**:
1. DevOps points environment variables to production Qdrant
2. DevOps runs: `uv run retrieve.py` (uses default test query)
3. Script validates connection, collection config, performs search
4. DevOps reviews collection statistics and validation report

**Expected Outcome**:
- Connection succeeds
- Collection has expected vector size (1024) and distance metric (cosine)
- Collection contains 301 points
- Sample query returns results with complete metadata
- All validation checks pass

## Assumptions

1. **Ingestion Complete**: Phase 0 ingestion has been completed successfully with 301 chunks in Qdrant
2. **Cohere API Access**: User has valid Cohere API key with access to embed-multilingual-v3.0 model
3. **Qdrant Access**: User has credentials for Qdrant cluster (URL and API key)
4. **Environment Setup**: User has `.env` file configured with required variables
5. **Python Environment**: User has UV package manager and virtual environment set up
6. **Collection Name**: Qdrant collection is named 'rag_embeddings' (not configurable in this version)
7. **Embedding Model**: Query embeddings use same model as ingestion (embed-multilingual-v3.0)
8. **Test Queries In Scope**: Default test queries are about topics covered in the textbook

## Out of Scope

1. **Re-ingestion**: Script does not perform document extraction, chunking, or embedding
2. **Collection Creation**: Script does not create or modify Qdrant collections
3. **Answer Generation**: Script does not use LLM to generate answers from retrieved chunks
4. **Interactive UI**: Script is CLI-only, no web interface
5. **Performance Benchmarking**: Script validates correctness, not query speed or throughput
6. **Multi-Collection Support**: Script only validates 'rag_embeddings' collection
7. **Custom Embedding Models**: Script assumes Cohere embed-multilingual-v3.0 (no model selection)
8. **Result Re-ranking**: Script returns raw similarity scores without post-processing
9. **Batch Query Testing**: Script processes one query at a time
10. **Automated Test Suite**: Script is for manual validation, not CI/CD integration

## Dependencies

### External Systems
- **Qdrant Cloud**: Vector database hosting the 'rag_embeddings' collection
- **Cohere API**: Embedding generation service (embed-multilingual-v3.0 model)

### Internal Systems
- **Phase 0 Ingestion Pipeline**: Must be completed before running validation (src/chatbot/backend/main.py)
- **Environment Configuration**: Requires .env file with QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY

### Data Dependencies
- **Existing Vector Collection**: Qdrant collection 'rag_embeddings' must exist and be populated
- **Embedding Model Consistency**: Query embeddings must use same model as ingestion

## Edge Cases

### Edge Case 1: Query Language Mismatch
**Scenario**: User queries in Urdu, but collection contains English chunks
**Expected Behavior**: Cohere's multilingual model should still return relevant results with lower similarity scores. Script reports results normally but may show WARNING if all scores < 0.3.

### Edge Case 2: Extremely Long Query
**Scenario**: User provides query exceeding 512 tokens (Cohere's max)
**Expected Behavior**: Script truncates query to 512 tokens, logs WARNING, proceeds with search.

### Edge Case 3: Collection Empty
**Scenario**: Qdrant collection exists but has 0 points
**Expected Behavior**: Script reports "FAIL: Collection is empty - run ingestion first" with suggestion to execute main.py.

### Edge Case 4: Partial Metadata
**Scenario**: Some chunks have chapter but no section (due to HTML parsing issues)
**Expected Behavior**: Script reports WARNING for chunks missing optional fields (section) but passes validation. FAIL only if required fields (text, source_url) are missing.

### Edge Case 5: Network Timeout During Search
**Scenario**: Qdrant connection drops mid-query
**Expected Behavior**: Script retries query once (up to 2 attempts total), then reports "FAIL: Qdrant query timeout" with suggestion to check network connectivity.

## Key Entities

### QueryRequest
**Purpose**: Represents a validation test query
**Attributes**:
- `query_text` (string, required): User's search query
- `top_k` (integer, default: 5): Number of results to retrieve
- `min_score` (float, default: 0.0): Minimum similarity score threshold

### QueryEmbedding
**Purpose**: Vector representation of the query
**Attributes**:
- `vector` (list of floats, 1024 dimensions): Query embedding
- `model` (string): Embedding model used (embed-multilingual-v3.0)
- `input_type` (string): Cohere input type (search_query)

### RetrievedChunk
**Purpose**: A single search result from Qdrant
**Attributes**:
- `chunk_id` (string, UUID): Unique identifier
- `text` (string, required): Chunk content
- `similarity_score` (float, 0.0-1.0, required): Cosine similarity
- `source_url` (string, required): Origin URL
- `chapter` (string, required): Chapter title
- `section` (string, optional): Section heading
- `chunk_index` (integer): Position in source document

### ValidationReport
**Purpose**: Structured output of validation checks
**Attributes**:
- `query` (string): Query tested
- `results_count` (integer): Number of chunks retrieved
- `checks` (list of ValidationCheck): Individual validation results
- `overall_status` (enum: PASS/FAIL/WARNING): Aggregated status

### ValidationCheck
**Purpose**: Result of a single validation test
**Attributes**:
- `check_name` (string): Name of validation (e.g., "Metadata Completeness")
- `status` (enum: PASS/FAIL/WARNING): Check result
- `message` (string): Explanation or error details
- `affected_items` (list of strings): IDs of failed items (if applicable)

## Risk Assessment

### Risk 1: Qdrant API Changes
**Impact**: High
**Probability**: Low
**Mitigation**: Pin qdrant-client version in requirements; validate collection schema before queries

### Risk 2: Cohere Rate Limiting
**Impact**: Medium
**Probability**: Medium
**Mitigation**: Implement exponential backoff; use single query per run (no batch testing)

### Risk 3: Embedding Model Mismatch
**Impact**: High
**Probability**: Low
**Mitigation**: Hardcode model name to match ingestion; validate vector dimensions before search

### Risk 4: Incomplete Metadata
**Impact**: Medium
**Probability**: Medium
**Mitigation**: Clearly distinguish required vs optional fields; report specific missing data

### Risk 5: Network Connectivity Issues
**Impact**: Medium
**Probability**: Medium
**Mitigation**: Implement connection timeouts; provide clear error messages with troubleshooting steps

## Notes

- This specification focuses solely on validation and testing the existing retrieval pipeline
- Implementation will be a single Python file (src/chatbot/backend/retrieve.py) as per requirements
- The validation script is a prerequisite for Phase 1 (Query API) to ensure the retrieval layer works correctly
- No FastAPI or web endpoints are included in this specification - this is a CLI-only validation tool
- The mention of "Backend implemented in FastAPI" in the original requirements refers to the future Phase 1 query API, not this validation script
- Neon PostgreSQL is mentioned in the original context but not used by this validation script (retrieval-only from Qdrant)
