"""
Retrieval & Pipeline Validation Script

This script validates the RAG retrieval pipeline by testing vector search,
metadata integrity, and Qdrant connectivity after Phase 0 ingestion.

Usage:
    uv run retrieve.py                                    # Use default query
    uv run retrieve.py --query "Your question"           # Custom query
    uv run retrieve.py --top-k 10 --min-score 0.4       # Custom parameters

Exit Codes:
    0 - PASS: All validation checks passed
    1 - FAIL: One or more critical checks failed
    2 - WARNING: Non-critical issues detected

Author: Claude Code
Date: 2025-12-25
"""

import argparse
import os
import sys
from datetime import datetime
from typing import Literal, NamedTuple
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient
from tenacity import retry, stop_after_attempt, wait_fixed


# =============================================================================
# Data Models (T002)
# =============================================================================

class QueryRequest(NamedTuple):
    """User's validation query and search parameters."""
    query_text: str
    top_k: int
    min_score: float


class QueryEmbedding(NamedTuple):
    """Vector representation of the query."""
    vector: list[float]
    model: str
    input_type: str


class RetrievedChunk(NamedTuple):
    """A single search result from Qdrant with metadata."""
    chunk_id: str
    text: str
    similarity_score: float
    source_url: str
    chapter: str | None
    section: str | None
    chunk_index: int | None
    token_count: int | None


class ValidationCheck(NamedTuple):
    """Result of a single validation test."""
    check_name: str
    status: Literal['PASS', 'FAIL', 'WARNING']
    message: str
    affected_items: list[str] = []


class ValidationReport(NamedTuple):
    """Aggregated results of all validation checks."""
    query: str
    results_count: int
    checks: list[ValidationCheck]
    overall_status: Literal['PASS', 'FAIL', 'WARNING']
    top_results: list[RetrievedChunk]


# =============================================================================
# Environment & Connection (T005, T006, T007, T028, T029, T030, T031)
# =============================================================================

def load_environment() -> dict[str, str]:
    """
    Load environment variables from .env file.

    Returns:
        dict: Environment variables (QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY)

    Raises:
        ValueError: If required environment variables are missing
    """
    load_dotenv()

    required_vars = ['QDRANT_URL', 'QDRANT_API_KEY', 'COHERE_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        error_msg = f"❌ FAIL: Missing required environment variables: {', '.join(missing_vars)}"
        suggested_fix = "Suggested fix: Add missing variables to .env file (see .env.example)"
        raise ValueError(f"{error_msg}\n{suggested_fix}")

    return {
        'QDRANT_URL': os.getenv('QDRANT_URL'),
        'QDRANT_API_KEY': os.getenv('QDRANT_API_KEY'),
        'COHERE_API_KEY': os.getenv('COHERE_API_KEY')
    }


def validate_connection(env_vars: dict[str, str]) -> tuple[QdrantClient, dict]:
    """
    Validate Qdrant connection and verify collection exists.

    Args:
        env_vars: Environment variables with Qdrant credentials

    Returns:
        tuple: (QdrantClient instance, collection info dict)

    Raises:
        ConnectionError: If connection fails
        ValueError: If collection doesn't exist
    """
    try:
        client = QdrantClient(
            url=env_vars['QDRANT_URL'],
            api_key=env_vars['QDRANT_API_KEY']
        )

        # Verify collection exists
        collection_name = 'rag_embeddings'
        try:
            collection_info = client.get_collection(collection_name)
            points_count = collection_info.points_count
            print(f"[OK] Connected to Qdrant: Collection '{collection_name}' has {points_count:,} points")
            return client, collection_info
        except Exception as e:
            if 'not found' in str(e).lower():
                error_msg = f"❌ FAIL: Collection '{collection_name}' not found in Qdrant"
                suggested_fix = "Suggested fix: Run ingestion script (uv run main.py) to create and populate collection"
                raise ValueError(f"{error_msg}\nReason: The target collection does not exist in the connected Qdrant instance\n{suggested_fix}")
            raise

    except Exception as e:
        if "timeout" in str(e).lower():
            error_msg = "❌ FAIL: Qdrant connection timeout"
            suggested_fix = "Suggested fix: Check QDRANT_URL and network connectivity"
            raise ConnectionError(f"{error_msg}\nReason: Could not reach Qdrant cluster\n{suggested_fix}")
        elif "auth" in str(e).lower() or "401" in str(e):
            error_msg = "❌ FAIL: Qdrant authentication failed"
            suggested_fix = "Suggested fix: Check QDRANT_API_KEY in .env file"
            raise ConnectionError(f"{error_msg}\nReason: Invalid API key\n{suggested_fix}")
        else:
            raise ConnectionError(f"❌ FAIL: Qdrant connection error: {e}")


def validate_collection_config(collection_info) -> ValidationCheck:
    """
    Verify collection schema matches expected configuration.

    Args:
        collection_info: Qdrant collection info object

    Returns:
        ValidationCheck: Result of configuration validation
    """
    expected_vector_size = 1024
    expected_distance = "Cosine"

    actual_vector_size = collection_info.config.params.vectors.size
    actual_distance = str(collection_info.config.params.vectors.distance)

    if actual_vector_size != expected_vector_size:
        return ValidationCheck(
            check_name="Collection Config",
            status="FAIL",
            message=f"Vector size mismatch (expected {expected_vector_size}, found {actual_vector_size})",
            affected_items=[]
        )

    if expected_distance.lower() not in actual_distance.lower():
        return ValidationCheck(
            check_name="Collection Config",
            status="FAIL",
            message=f"Distance metric mismatch (expected {expected_distance}, found {actual_distance})",
            affected_items=[]
        )

    return ValidationCheck(
        check_name="Collection Config",
        status="PASS",
        message=f"{actual_vector_size}-dim, {actual_distance}",
        affected_items=[]
    )


# =============================================================================
# Query Embedding (T008, T009)
# =============================================================================

@retry(stop=stop_after_attempt(2), wait=wait_fixed(2))
def generate_query_embedding(query: str, api_key: str) -> QueryEmbedding:
    """
    Generate query embedding using Cohere with retry logic.

    Args:
        query: User's search query
        api_key: Cohere API key

    Returns:
        QueryEmbedding: Generated embedding with metadata

    Raises:
        ValueError: If API call fails or embedding dimensions are wrong
    """
    try:
        client = cohere.Client(api_key=api_key)
        response = client.embed(
            texts=[query],
            model="embed-multilingual-v3.0",
            input_type="search_query",
            embedding_types=["float"]
        )

        embedding_vector = response.embeddings.float[0]

        # Validate dimensions
        if len(embedding_vector) != 1024:
            raise ValueError(
                f"❌ FAIL: Query embedding dimension mismatch\n"
                f"Expected: 1024 dimensions (Cohere embed-multilingual-v3.0)\n"
                f"Got: {len(embedding_vector)} dimensions\n"
                f"Suggested fix: Check COHERE_API_KEY is using correct model"
            )

        return QueryEmbedding(
            vector=embedding_vector,
            model="embed-multilingual-v3.0",
            input_type="search_query"
        )

    except cohere.CohereAPIError as e:
        if e.status_code == 429:
            raise ValueError(
                f"❌ FAIL: Cohere API rate limit exceeded\n"
                f"Reason: Too many requests\n"
                f"Suggested fix: Wait 60 seconds before retrying"
            )
        else:
            raise ValueError(
                f"❌ FAIL: Cohere API error: {e.message}\n"
                f"Suggested fix: Check COHERE_API_KEY in .env file"
            )


# =============================================================================
# Search Execution (T010)
# =============================================================================

def perform_search(client: QdrantClient, embedding: QueryEmbedding, top_k: int) -> list:
    """
    Perform vector similarity search in Qdrant.

    Args:
        client: Qdrant client instance
        embedding: Query embedding
        top_k: Number of results to retrieve

    Returns:
        list: Search results (points)

    Raises:
        RuntimeError: If search fails
    """
    try:
        results = client.query_points(
            collection_name="rag_embeddings",
            query=embedding.vector,
            limit=top_k,
            with_payload=True
        ).points

        return results

    except Exception as e:
        if "timeout" in str(e).lower():
            raise RuntimeError(
                f"❌ FAIL: Qdrant query timeout\n"
                f"Reason: Search operation timed out\n"
                f"Suggested fix: Check network connectivity to Qdrant cluster"
            )
        else:
            raise RuntimeError(f"❌ FAIL: Qdrant search failed: {e}")


# =============================================================================
# Result Validation (T011, T012, T019, T020, T021, T022, T023)
# =============================================================================

def validate_results(results: list, min_score: float) -> list[ValidationCheck]:
    """
    Validate search results for metadata and score correctness.

    Args:
        results: Qdrant search results
        min_score: Minimum similarity score threshold

    Returns:
        list[ValidationCheck]: Validation results
    """
    checks = []

    # Check 1: Non-empty results (WARNING if empty, not FAIL)
    if len(results) == 0:
        checks.append(ValidationCheck(
            check_name="Search Execution",
            status="WARNING",
            message="No results found - query may be outside textbook scope",
            affected_items=[]
        ))
        return checks

    checks.append(ValidationCheck(
        check_name="Search Execution",
        status="PASS",
        message=f"{len(results)} results returned",
        affected_items=[]
    ))

    # Check 2: Metadata Completeness
    missing_text = []
    missing_source_url = []
    missing_chapter = []
    missing_section = []
    wrong_domain = []

    expected_domain = "https://shumailaaijaz.github.io/physical-ai-textbook/"

    for result in results:
        chunk_id = str(result.id)
        payload = result.payload

        # Required fields
        if not payload.get('text'):
            missing_text.append(chunk_id)
        if not payload.get('source_url'):
            missing_source_url.append(chunk_id)
        elif not payload['source_url'].startswith(expected_domain):
            wrong_domain.append(chunk_id)

        # Optional fields
        if not payload.get('chapter'):
            missing_chapter.append(chunk_id)
        if not payload.get('section'):
            missing_section.append(chunk_id)

    # Report required field failures
    if missing_text:
        checks.append(ValidationCheck(
            check_name="Metadata Completeness",
            status="FAIL",
            message=f"{len(missing_text)} chunks missing required field 'text'",
            affected_items=missing_text
        ))
    if missing_source_url:
        checks.append(ValidationCheck(
            check_name="Metadata Completeness",
            status="FAIL",
            message=f"{len(missing_source_url)} chunks missing required field 'source_url'",
            affected_items=missing_source_url
        ))

    # Report optional field warnings
    if missing_chapter:
        checks.append(ValidationCheck(
            check_name="Metadata Completeness",
            status="WARNING",
            message=f"{len(missing_chapter)} chunks missing optional field 'chapter'",
            affected_items=missing_chapter
        ))
    if missing_section:
        checks.append(ValidationCheck(
            check_name="Metadata Completeness",
            status="WARNING",
            message=f"{len(missing_section)} chunks missing optional field 'section'",
            affected_items=missing_section
        ))
    if wrong_domain:
        checks.append(ValidationCheck(
            check_name="Metadata Completeness",
            status="WARNING",
            message=f"{len(wrong_domain)} chunks have unexpected source domain",
            affected_items=wrong_domain
        ))

    # If no metadata issues, report PASS
    if not missing_text and not missing_source_url:
        checks.append(ValidationCheck(
            check_name="Metadata Completeness",
            status="PASS",
            message=f"{len(results)}/{len(results)} chunks have required metadata",
            affected_items=[]
        ))

    # Check 3: Score Validation
    invalid_scores = []
    scores = []

    for result in results:
        score = result.score
        scores.append(score)

        if not (0.0 <= score <= 1.0):
            invalid_scores.append(str(result.id))

    if invalid_scores:
        checks.append(ValidationCheck(
            check_name="Score Validation",
            status="FAIL",
            message=f"{len(invalid_scores)} chunks have invalid scores (outside 0.0-1.0 range)",
            affected_items=invalid_scores
        ))
    else:
        # Check descending order
        is_descending = all(scores[i] >= scores[i+1] for i in range(len(scores)-1))

        if not is_descending:
            checks.append(ValidationCheck(
                check_name="Score Validation",
                status="FAIL",
                message="Results not ordered by descending similarity score",
                affected_items=[]
            ))
        else:
            min_score_val = min(scores)
            max_score_val = max(scores)
            checks.append(ValidationCheck(
                check_name="Score Validation",
                status="PASS",
                message=f"Scores in range {min_score_val:.3f}-{max_score_val:.3f}, descending order",
                affected_items=[]
            ))

    return checks


# =============================================================================
# Report Generation (T013, T024, T025, T038)
# =============================================================================

def print_report(report: ValidationReport):
    """
    Print structured validation report with ASCII symbols.

    Args:
        report: ValidationReport to display
    """
    print("=" * 60)
    print("RETRIEVAL VALIDATION REPORT")
    print("=" * 60)
    print(f"Query: \"{report.query}\"")
    print(f"Results: {report.results_count} chunks retrieved")
    print()

    # Print results
    if report.results_count > 0:
        print("-" * 60)
        for idx, chunk in enumerate(report.top_results, 1):
            print(f"Result {idx} (score: {chunk.similarity_score:.3f}):")
            # Sanitize chapter and section for Windows console - remove non-ASCII characters
            chapter_display = (chunk.chapter or 'N/A').encode('ascii', 'ignore').decode('ascii')
            section_display = (chunk.section or 'N/A').encode('ascii', 'ignore').decode('ascii')
            print(f"  Chapter: {chapter_display}")
            print(f"  Section: {section_display}")
            print(f"  Source: {chunk.source_url}")

            # Sanitize and truncate text to ~200 characters
            # Remove all non-ASCII characters for Windows console compatibility
            sanitized_text = chunk.text.encode('ascii', 'ignore').decode('ascii')
            text_preview = sanitized_text[:200] + "..." if len(sanitized_text) > 200 else sanitized_text
            print(f"  Text: {text_preview}")
            print()

    # Print validation checks
    print("-" * 60)
    print("VALIDATION CHECKS")
    print("-" * 60)

    for check in report.checks:
        symbol = "[OK]" if check.status == "PASS" else ("[FAIL]" if check.status == "FAIL" else "[WARN]")
        print(f"{symbol} {check.check_name}: {check.status}")
        print(f"   {check.message}")

        if check.affected_items:
            print(f"   Affected items: {', '.join(check.affected_items[:5])}")
            if len(check.affected_items) > 5:
                print(f"   ... and {len(check.affected_items) - 5} more")
        print()

    # Print overall status
    print("=" * 60)
    overall_symbol = "[OK]" if report.overall_status == "PASS" else ("[FAIL]" if report.overall_status == "FAIL" else "[WARN]")
    print(f"{overall_symbol} OVERALL STATUS: {report.overall_status}")
    print("=" * 60)


# =============================================================================
# Main Orchestration (T014, T015, T016, T032, T033, T034)
# =============================================================================

def main():
    """
    Main orchestration flow for validation script.

    Exit codes:
        0 - PASS: All checks passed
        1 - FAIL: Critical failure
        2 - WARNING: Non-critical issues
    """
    # Parse CLI arguments (T003)
    parser = argparse.ArgumentParser(
        description='Validate RAG retrieval pipeline',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--query',
        type=str,
        default="What are vector databases?",
        help='Test query (default: "What are vector databases?")'
    )
    parser.add_argument(
        '--top-k',
        type=int,
        default=5,
        help='Number of results to retrieve (default: 5)'
    )
    parser.add_argument(
        '--min-score',
        type=float,
        default=0.0,
        help='Minimum similarity score threshold (default: 0.0)'
    )

    args = parser.parse_args()

    request = QueryRequest(
        query_text=args.query,
        top_k=args.top_k,
        min_score=args.min_score
    )

    try:
        # Phase 1: Load environment and validate connection
        env_vars = load_environment()
        client, collection_info = validate_connection(env_vars)

        collection_check = validate_collection_config(collection_info)

        # Phase 2: Generate query embedding
        print(f"[*] Generating query embedding...")
        embedding = generate_query_embedding(request.query_text, env_vars['COHERE_API_KEY'])
        print(f"[OK] Embedding generated ({len(embedding.vector)} dimensions)")

        embedding_check = ValidationCheck(
            check_name="Query Embedding",
            status="PASS",
            message=f"{len(embedding.vector)} dimensions",
            affected_items=[]
        )

        # Phase 3: Perform search
        print(f"[*] Searching Qdrant...")
        results = perform_search(client, embedding, request.top_k)
        print(f"[OK] Found {len(results)} results")
        print()

        # Phase 4: Validate results
        result_checks = validate_results(results, request.min_score)

        # Phase 5: Create retrieved chunks
        retrieved_chunks = []
        for result in results:
            chunk = RetrievedChunk(
                chunk_id=str(result.id),
                text=result.payload.get('text', ''),
                similarity_score=result.score,
                source_url=result.payload.get('source_url', ''),
                chapter=result.payload.get('chapter'),
                section=result.payload.get('section'),
                chunk_index=result.payload.get('chunk_index'),
                token_count=result.payload.get('token_count')
            )
            retrieved_chunks.append(chunk)

        # Aggregate all checks
        all_checks = [
            ValidationCheck("Connection", "PASS", f"Connected to Qdrant", []),
            collection_check,
            embedding_check
        ] + result_checks

        # Determine overall status
        has_fail = any(check.status == "FAIL" for check in all_checks)
        has_warning = any(check.status == "WARNING" for check in all_checks)

        overall_status = "FAIL" if has_fail else ("WARNING" if has_warning else "PASS")

        # Create and print report
        report = ValidationReport(
            query=request.query_text,
            results_count=len(results),
            checks=all_checks,
            overall_status=overall_status,
            top_results=retrieved_chunks
        )

        print_report(report)

        # Exit with appropriate code
        if overall_status == "PASS":
            sys.exit(0)
        elif overall_status == "WARNING":
            sys.exit(2)
        else:
            sys.exit(1)

    except (ValueError, ConnectionError, RuntimeError) as e:
        # These are expected errors with actionable messages
        print(str(e), file=sys.stderr)
        sys.exit(1)

    except Exception as e:
        # Unexpected errors
        print(f"❌ FAIL: Unexpected error during validation", file=sys.stderr)
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
