# Research & Technical Decisions: Retrieval & Pipeline Validation

**Feature**: Retrieval & Pipeline Validation
**Date**: 2025-12-25
**Status**: Resolved

## Overview

This document resolves the 5 research questions (R1-R5) identified in `plan.md` for the `retrieve.py` validation script. Each decision includes rationale, alternatives considered, and implementation implications.

---

## Decision 1: CLI Argument Parsing Strategy (R1)

### Question
How should the script accept test queries and configuration options?

### Decision
**Use argparse with optional query override and sensible defaults**

**Implementation**:
```python
parser = argparse.ArgumentParser(description='Validate RAG retrieval pipeline')
parser.add_argument('--query', type=str,
                    default="What are vector databases?",
                    help='Test query (default: vector database question)')
parser.add_argument('--top-k', type=int, default=5,
                    help='Number of results to retrieve (default: 5)')
parser.add_argument('--min-score', type=float, default=0.0,
                    help='Minimum similarity score threshold (default: 0.0)')
```

### Rationale
- **Developer UX**: Default query allows zero-config validation (`uv run retrieve.py`)
- **Flexibility**: Custom queries supported via `--query` flag
- **CI/CD friendly**: Exit codes and structured output work well with pipelines
- **No interactive prompts**: Avoids blocking behavior in automated environments

### Alternatives Considered
1. **Hardcoded queries only**: Too rigid, doesn't support custom validation scenarios
2. **Interactive prompt**: Breaks CI/CD automation, requires user input
3. **Config file (YAML/JSON)**: Overkill for simple validation script, adds complexity

### Implementation Notes
- Use `argparse` (stdlib, no dependencies)
- Default query should be representative of textbook content (vector databases, robotics, AI)
- Document CLI usage in `quickstart.md`

---

## Decision 2: Validation Report Format (R2)

### Question
What's the optimal output format for structured validation reports?

### Decision
**Plain text with clear sections, no external dependencies for formatting**

**Format Structure**:
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
  [Text continues for ~200 characters]

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

### Rationale
- **Human-readable**: Developers can quickly scan results
- **Zero dependencies**: No colorama, rich, or formatting libraries
- **Copy-pasteable**: Results can be shared in Slack, GitHub issues, documentation
- **CI/CD parseable**: Exit codes (0/1/2) convey status, text provides details

### Alternatives Considered
1. **JSON output**: Machine-readable but poor developer UX, requires `jq` for reading
2. **Colored terminal output (colorama/rich)**: Adds dependency, breaks in non-TTY environments
3. **Markdown tables**: Nice for documentation but harder to read in terminal
4. **HTML report**: Requires file writing, overkill for validation script

### Implementation Notes
- Use Unicode checkmarks (✅/❌/⚠️) for visual clarity (works in most terminals)
- Keep line width under 80 characters for terminal readability
- Print to stdout (for pass/info), stderr (for failures/warnings)

---

## Decision 3: Error Handling Strategy (R3)

### Question
How should validation failures be communicated and handled?

### Decision
**Validation accumulator pattern with exit codes and actionable error messages**

**Exit Codes**:
- `0` - PASS: All validation checks passed
- `1` - FAIL: One or more critical checks failed (connection, metadata, scores)
- `2` - WARNING: Non-critical issues detected (empty results, optional metadata missing)

**Error Message Format**:
```
❌ FAIL: [Check Name]
Reason: [Technical explanation]
Suggested fix: [Actionable next step]
```

**Example**:
```
❌ FAIL: Collection 'rag_embeddings' not found in Qdrant
Reason: The target collection does not exist in the connected Qdrant instance
Suggested fix: Run ingestion script (uv run main.py) to create and populate collection
```

### Rationale
- **Accumulation pattern**: Collects all failures before reporting (don't fail-fast), gives complete picture
- **Exit codes**: CI/CD pipelines can detect status programmatically
- **Actionable messages**: Users know exactly how to fix issues (no Googling required)
- **Fail vs. Warning**: Distinguishes between critical failures (broken pipeline) and expected conditions (empty results)

### Alternatives Considered
1. **Exception-based (fail-fast)**: Stops at first error, doesn't show full problem scope
2. **Silent failures**: No exit code variance, hides issues
3. **Verbose logging levels**: Adds complexity, overkill for single-purpose script

### Implementation Notes
- **Critical failures** (exit 1): Connection errors, missing collection, dimension mismatch, missing required metadata (text, source_url)
- **Warnings** (exit 2): Empty results (query outside scope), missing optional metadata (section), low similarity scores
- **Success** (exit 0): All checks pass, results valid

---

## Decision 4: Metadata Validation Rules (R4)

### Question
Which metadata fields are required vs. optional, and what constitutes a validation failure?

### Decision
**Two-tier validation: Required fields cause FAIL, optional fields cause WARNING**

**Required Fields** (must be present and valid):
- `text`: Non-empty string
- `source_url`: Well-formed URL starting with `https://shumailaaijaz.github.io/physical-ai-textbook/`

**Optional Fields** (WARNING if missing, not FAIL):
- `chapter`: String (may be empty for blog posts, index pages)
- `section`: String (may be empty if page has no subsections)
- `chunk_index`: Integer (helpful but not critical for validation)

**Validation Logic**:
```python
def validate_chunk_metadata(chunk) -> ValidationCheck:
    # FAIL conditions
    if not chunk.payload.get('text'):
        return ValidationCheck('Metadata', 'FAIL',
                               f"Chunk {chunk.id} missing required field 'text'")

    if not chunk.payload.get('source_url'):
        return ValidationCheck('Metadata', 'FAIL',
                               f"Chunk {chunk.id} missing required field 'source_url'")

    url = chunk.payload['source_url']
    if not url.startswith('https://shumailaaijaz.github.io/physical-ai-textbook/'):
        return ValidationCheck('Metadata', 'WARNING',
                               f"Chunk {chunk.id} has unexpected source domain: {url}")

    # WARNING conditions
    if not chunk.payload.get('chapter'):
        return ValidationCheck('Metadata', 'WARNING',
                               f"Chunk {chunk.id} missing optional field 'chapter'")

    return ValidationCheck('Metadata', 'PASS', 'All metadata present')
```

### Rationale
- **Matches ingestion reality**: Phase 0 ingestion may fail to extract chapter/section from some pages (blog posts, index)
- **Focuses on critical data**: `text` and `source_url` are essential for retrieval and attribution
- **Avoids false positives**: Missing optional metadata shouldn't block validation
- **Provides visibility**: WARNING status alerts to metadata gaps without failing the check

### Alternatives Considered
1. **All fields required**: Too strict, would fail on legitimate edge cases (blog posts without chapters)
2. **No validation**: Misses critical data quality issues
3. **Configurable strictness levels**: Adds complexity, single default is sufficient

### Implementation Notes
- Print summary of metadata issues at end: "5/5 chunks have all required fields, 2/5 missing optional 'section' field"
- Document expected metadata schema in `data-model.md`

---

## Decision 5: Query Embedding Generation (R5)

### Question
Should the script handle embedding errors differently than search errors?

### Decision
**Implement retry logic for transient failures, distinct error messages for embedding vs. search**

**Embedding Error Handling**:
```python
@retry(stop=stop_after_attempt(2), wait=wait_fixed(2))
def generate_query_embedding(query: str, client: cohere.Client) -> list[float]:
    """Generate query embedding with retry on transient failures."""
    try:
        response = client.embed(
            texts=[query],
            model="embed-multilingual-v3.0",
            input_type="search_query",
            embedding_types=["float"]
        )
        return response.embeddings.float[0]
    except cohere.CohereAPIError as e:
        if e.status_code == 429:  # Rate limit
            raise  # Let retry decorator handle
        elif e.status_code in (500, 502, 503, 504):  # Server errors
            raise  # Let retry decorator handle
        else:  # 4xx client errors (bad request, auth failure)
            # Don't retry, fail immediately
            raise ValueError(f"Cohere API error: {e.message}")
```

**Search Error Handling**:
```python
def perform_search(client: QdrantClient, embedding: list[float], top_k: int):
    """Perform vector search with clear error messages."""
    try:
        return client.query_points(
            collection_name="rag_embeddings",
            query=embedding,
            limit=top_k,
            with_payload=True
        ).points
    except Exception as e:
        if "timeout" in str(e).lower():
            raise ConnectionError(
                "Qdrant query timeout - check network connectivity"
            )
        elif "not found" in str(e).lower():
            raise ValueError(
                "Collection 'rag_embeddings' not found - run ingestion first"
            )
        else:
            raise RuntimeError(f"Qdrant search failed: {e}")
```

### Rationale
- **Transient failures**: Network glitches, rate limits are common and retriable
- **Client errors**: Bad auth, invalid model shouldn't retry (fail fast)
- **Distinct messages**: Embedding errors point to Cohere/API key issues, search errors point to Qdrant/network issues
- **User guidance**: Error messages suggest specific fixes (check API key vs. check network vs. run ingestion)

### Alternatives Considered
1. **No retry logic**: Fragile to transient network issues
2. **Same error handling for both**: Loses specificity, harder to debug
3. **Exponential backoff**: Overkill for single-query validation script (fixed 2s wait is fine)

### Implementation Notes
- Use `tenacity` library (already in Phase 0 dependencies) for retry decorator
- Max 2 attempts (1 retry) to avoid hanging script
- Log retry attempts: "Retrying embedding generation (attempt 2/2)..."
- Distinguish between embedding errors (Cohere API) and search errors (Qdrant) in validation report

---

## Summary of Decisions

| Decision | Choice | Impact |
|----------|--------|--------|
| **R1: CLI Parsing** | argparse with defaults | Easy to run (`uv run retrieve.py`), flexible for custom queries |
| **R2: Report Format** | Plain text, no deps | Human-readable, zero setup, CI/CD friendly |
| **R3: Error Handling** | Accumulator + exit codes | Complete failure visibility, actionable messages |
| **R4: Metadata Rules** | Required (text, URL) vs. Optional (chapter, section) | Realistic validation, avoids false positives |
| **R5: Retry Logic** | 1 retry for transient failures, distinct errors | Resilient to network issues, clear debugging |

**All research questions resolved.** Ready for Phase 1 (data-model.md, quickstart.md).
