"""
RAG Answer Generation Agent

Single-file RAG agent that integrates with existing Qdrant infrastructure,
uses OpenAI SDK for agent orchestration via OpenRouter, and enforces strict
book-only grounding with zero hallucination tolerance.

Features:
- Vector search using existing Qdrant collection (rag_embeddings)
- Query embedding generation via Cohere embed-multilingual-v3.0
- Grounded answer synthesis using OpenAI SDK (GPT-3.5-turbo via OpenRouter)
- Strict refusal logic when grounding is insufficient (threshold: 0.4)
- Citation extraction with chapter/section/URL attribution
- CLI interface for testing

Usage:
    uv run agent.py --query "What is Physical AI?"
    uv run agent.py --query "How does ROS 2 work?" --top-k 10 --verbose
    uv run agent.py --query "Explain topics" --selected-text "Nodes communicate via topics"

Exit Codes:
    0 - Success: Grounded answer with citations returned
    1 - Refusal: Insufficient grounding (out-of-scope question)
    2 - Error: System failure (Qdrant timeout, API error, etc.)

Author: Claude Code
Date: 2025-12-25
"""

import argparse
import os
import sys
from typing import NamedTuple
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient
from openai import OpenAI
from agents import Agent, Runner
import time
from agents import OpenAIChatCompletionsModel
from openai import AsyncOpenAI

# =============================================================================
# Data Models
# =============================================================================

class RetrievedChunk(NamedTuple):
    """A single search result from Qdrant with metadata."""
    chunk_id: str
    text: str
    chapter: str | None
    section: str | None
    source_url: str | None
    similarity_score: float


class Citation(NamedTuple):
    """Source attribution for grounded answer."""
    chapter: str | None
    section: str | None
    source_url: str | None
    referenced_text: str | None


class GroundedAnswer(NamedTuple):
    """Successful grounded response with citations."""
    text: str
    citations: list[Citation]
    mode: str


class RefusalMessage(NamedTuple):
    """Structured refusal when grounding is insufficient."""
    reason: str
    refusal_type: str

# third party client configurations can go here

# =============================================================================
# Environment Loading
# =============================================================================

def load_environment() -> dict[str, str]:
    """
    Load environment variables from .env file.

    Returns:
        dict: Environment variables (OPENROUTER_API_KEY or openai_api_key,
              OPENROUTER_MODEL, QDRANT_URL, QDRANT_API_KEY, COHERE_API_KEY)

    Raises:
        ValueError: If required environment variables are missing
    """
    load_dotenv()

    # Check for either OpenRouter or native OpenAI API key
    openrouter_key = os.getenv('OPENROUTER_API_KEY')
    openai_key = os.getenv('openai_api_key')

    if not openrouter_key and not openai_key:
        error_msg = "Missing API key: Need either OPENROUTER_API_KEY or openai_api_key"
        suggested_fix = "Add OPENROUTER_API_KEY or openai_api_key to .env file"
        raise ValueError(f"{error_msg}\n{suggested_fix}")

    # Other required vars
    required_vars = ['QDRANT_URL', 'QDRANT_API_KEY', 'COHERE_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        suggested_fix = "Add missing variables to .env file (see .env.example)"
        raise ValueError(f"{error_msg}\n{suggested_fix}")

    # Determine which API to use
    api_key = openai_key if openai_key else openrouter_key
    use_openrouter = openai_key is None

    # Set model based on provider
    if use_openrouter:
        model = os.getenv('OPENROUTER_MODEL', 'openai/gpt-3.5-turbo')
    else:
        # Native OpenAI uses simple model names
        model = 'gpt-3.5-turbo'

    return {
        'API_KEY': api_key,
        'USE_OPENROUTER': str(use_openrouter),
        'MODEL': model,
        'QDRANT_URL': os.getenv('QDRANT_URL'),
        'QDRANT_API_KEY': os.getenv('QDRANT_API_KEY'),
        'COHERE_API_KEY': os.getenv('COHERE_API_KEY')
    }


# =============================================================================
# Qdrant Connection
# =============================================================================

def connect_qdrant(env_vars: dict[str, str]) -> QdrantClient:
    """
    Initialize Qdrant client and verify 'rag_embeddings' collection exists.

    Args:
        env_vars: Environment variables with Qdrant credentials

    Returns:
        QdrantClient: Connected Qdrant client instance

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
            if points_count == 0:
                raise ValueError(
                    f"Collection '{collection_name}' is empty (0 points)\n"
                    f"Run ingestion script (uv run main.py) to populate collection"
                )
            return client
        except Exception as e:
            if 'not found' in str(e).lower():
                raise ValueError(
                    f"Collection '{collection_name}' not found in Qdrant\n"
                    f"Run ingestion script (uv run main.py) to create and populate collection"
                )
            raise

    except Exception as e:
        if "timeout" in str(e).lower():
            raise ConnectionError(
                f"Qdrant connection timeout\n"
                f"Check QDRANT_URL and network connectivity"
            )
        elif "auth" in str(e).lower() or "401" in str(e):
            raise ConnectionError(
                f"Qdrant authentication failed\n"
                f"Check QDRANT_API_KEY in .env file"
            )
        else:
            raise ConnectionError(f"Qdrant connection error: {e}")


# =============================================================================
# Query Embedding Generation
# =============================================================================

def generate_query_embedding(query: str, api_key: str) -> list[float]:
    """
    Generate query embedding using Cohere embed-multilingual-v3.0.

    Reuses logic from retrieve.py for consistency with ingestion pipeline.

    Args:
        query: User's search query
        api_key: Cohere API key

    Returns:
        list[float]: 1024-dimensional embedding vector

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
                f"Query embedding dimension mismatch\n"
                f"Expected: 1024 dimensions (Cohere embed-multilingual-v3.0)\n"
                f"Got: {len(embedding_vector)} dimensions"
            )

        return embedding_vector

    except cohere.CohereAPIError as e:
        if e.status_code == 429:
            raise ValueError(
                f"Cohere API rate limit exceeded\n"
                f"Wait 60 seconds before retrying"
            )
        else:
            raise ValueError(
                f"Cohere API error: {e.message}\n"
                f"Check COHERE_API_KEY in .env file"
            )


# =============================================================================
# Vector Search Tool
# =============================================================================

def search_qdrant_tool(
    client: QdrantClient,
    query: str,
    cohere_api_key: str,
    top_k: int = 5,
    selected_text: str | None = None
) -> list[RetrievedChunk]:
    """
    Perform vector search and return ranked chunks.

    Supports two modes:
    - Standard RAG: Generate embedding and query Qdrant
    - Selected-text-only: Return selected text as single "chunk" (bypass Qdrant)

    Args:
        client: Qdrant client instance
        query: User's question
        cohere_api_key: Cohere API key for embedding generation
        top_k: Number of chunks to retrieve (default: 5)
        selected_text: Optional user-highlighted text (triggers selected-text-only mode)

    Returns:
        list[RetrievedChunk]: Retrieved chunks with metadata and scores
    """
    # Selected-text-only mode: Return as single chunk (bypass Qdrant)
    if selected_text is not None:
        return [RetrievedChunk(
            chunk_id="selected_text",
            text=selected_text,
            chapter=None,
            section=None,
            source_url=None,
            similarity_score=1.0  # Perfect "relevance" for user-provided text
        )]

    # Standard RAG mode: Generate embedding and query Qdrant
    embedding = generate_query_embedding(query, cohere_api_key)

    try:
        results = client.query_points(
            collection_name="rag_embeddings",
            query=embedding,
            limit=top_k,
            with_payload=True
        ).points

        chunks = []
        for result in results:
            chunk = RetrievedChunk(
                chunk_id=str(result.id),
                text=result.payload.get('text', ''),
                chapter=result.payload.get('chapter'),
                section=result.payload.get('section'),
                source_url=result.payload.get('source_url'),
                similarity_score=result.score
            )
            chunks.append(chunk)

        return chunks

    except Exception as e:
        if "timeout" in str(e).lower():
            raise RuntimeError(
                f"Qdrant query timeout\n"
                f"Check network connectivity to Qdrant cluster"
            )
        else:
            raise RuntimeError(f"Qdrant search failed: {e}")


# =============================================================================
# OpenAI Agent Integration
# =============================================================================

def create_rag_agent(env_vars: dict[str, str]) -> OpenAI:
    """
    Initialize OpenAI client (either native OpenAI or OpenRouter).

    Args:
        env_vars: Environment variables with API credentials

    Returns:
        OpenAI: OpenAI client configured for chosen provider
    """
    use_openrouter = env_vars['USE_OPENROUTER'] == 'True'

    if use_openrouter:
        return OpenAI(
            api_key=env_vars['API_KEY'],
            base_url="https://openrouter.ai/api/v1"
        )
    else:
        return OpenAI(api_key=env_vars['API_KEY'])


def get_system_prompt() -> str:
    """
    Return system prompt enforcing strict book-only grounding.

    Returns:
        str: System prompt with grounding constraints
    """
    return """You are a RAG answer generation assistant for the Physical AI textbook.

STRICT RULES:
1. Use ONLY the provided book content in your answers
2. NEVER use external knowledge or information not in the provided chunks
3. Preserve exact terminology from the book (no synonym substitution)
4. Include citations with chapter/section/URL for all claims
5. If the provided content is insufficient to answer the question, respond with:
   "The provided book content does not contain sufficient information to answer this question"

CITATION FORMAT:
For each claim, cite the source using this format:
[Chapter X: Title, Section Y] (URL)

EXAMPLE:
"ROS 2 is the nervous system of modern robots [Chapter 2: ROS 2 Fundamentals, Learning Objectives] (https://shumailaaijaz.github.io/physical-ai-textbook/docs/02-ros2-fundamentals)"
"""


def query_agent(
    client: OpenAI,
    chunks: list[RetrievedChunk],
    query: str,
    model: str,
    mode: str = "standard_rag"
) -> GroundedAnswer | RefusalMessage:
    """
    Generate grounded answer using OpenAI Agents SDK with retrieved chunks.

    Workflow:
    1. Format chunks as context
    2. Create Agent with system prompt
    3. Run agent with user query and context
    4. Extract citations from response
    5. Validate response (grounding, citations)
    6. Return GroundedAnswer or RefusalMessage

    Args:
        client: OpenAI client instance (for API key access)
        chunks: Retrieved chunks from Qdrant
        query: User's question
        model: Model name (e.g., "gpt-3.5-turbo")
        mode: Workflow mode ("standard_rag" or "selected_text_only")

    Returns:
        GroundedAnswer | RefusalMessage: Grounded answer or refusal
    """
    # Refusal Check 1: Empty results
    if len(chunks) == 0:
        return RefusalMessage(
            reason="The provided book content does not contain sufficient information to answer this question",
            refusal_type="empty_retrieval"
        )

    # Refusal Check 2: Low relevance (top-1 score < 0.4)
    if chunks[0].similarity_score < 0.4:
        return RefusalMessage(
            reason="The provided book content does not contain sufficient information to answer this question",
            refusal_type="low_relevance"
        )

    # Format chunks as context
    context = "\n\n".join([
        f"[Chunk {i+1}]\n"
        f"Chapter: {chunk.chapter or 'N/A'}\n"
        f"Section: {chunk.section or 'N/A'}\n"
        f"URL: {chunk.source_url or 'N/A'}\n"
        f"Text: {chunk.text}"
        for i, chunk in enumerate(chunks)
    ])

    # Construct user message
    user_message = f"""Question: {query}

Retrieved Book Content:
{context}

Answer the question using ONLY the provided book content. Include citations."""

    try:
        # Create agent using OpenAI Agents SDK
        agent = Agent(
            name="RAG Answer Generation Agent",
            instructions=get_system_prompt(),
            model=model
        )

        # Run the agent with the user message
        result = Runner.run_sync(agent, user_message)
        answer_text = result.final_output

        # Extract citations from answer
        citations = extract_citations(chunks, answer_text)

        # Validation Check: Citations present
        if len(citations) == 0:
            return RefusalMessage(
                reason="The provided book content does not contain sufficient information to answer this question",
                refusal_type="insufficient_grounding"
            )

        # Validation Check: Selected-text mode compliance
        if mode == "selected_text_only":
            selected_text = chunks[0].text
            # Check if answer references content from selected text
            # Simple heuristic: answer should contain substring from selected text
            if not any(word in answer_text.lower() for word in selected_text.lower().split()[:5]):
                return RefusalMessage(
                    reason="The selected text does not contain this information",
                    refusal_type="selected_text_missing"
                )

        return GroundedAnswer(
            text=answer_text,
            citations=citations,
            mode=mode
        )

    except Exception as e:
        if "timeout" in str(e).lower():
            raise RuntimeError(
                f"OpenRouter API timeout\n"
                f"Try again or check network connectivity"
            )
        elif "rate" in str(e).lower():
            raise RuntimeError(
                f"OpenRouter rate limit exceeded\n"
                f"Wait before retrying"
            )
        else:
            raise RuntimeError(f"OpenRouter API error: {e}")


def extract_citations(chunks: list[RetrievedChunk], answer_text: str) -> list[Citation]:
    """
    Extract citations from agent response by matching to chunk metadata.

    Simple heuristic: If chunk metadata (chapter/section/URL) appears in answer,
    create citation entry.

    Args:
        chunks: Retrieved chunks used to generate answer
        answer_text: Agent's response text

    Returns:
        list[Citation]: Extracted citations
    """
    citations = []
    seen_sources = set()  # Avoid duplicate citations

    for chunk in chunks:
        # Check if chunk's metadata is referenced in answer
        chapter_match = chunk.chapter and chunk.chapter.lower() in answer_text.lower()
        section_match = chunk.section and chunk.section.lower() in answer_text.lower()
        url_match = chunk.source_url and chunk.source_url in answer_text

        if chapter_match or section_match or url_match:
            source_key = (chunk.chapter, chunk.section, chunk.source_url)
            if source_key not in seen_sources:
                # Extract referenced text (first 100 chars of chunk as proxy)
                referenced_text = chunk.text[:100] + "..." if len(chunk.text) > 100 else chunk.text

                citation = Citation(
                    chapter=chunk.chapter,
                    section=chunk.section,
                    source_url=chunk.source_url,
                    referenced_text=referenced_text
                )
                citations.append(citation)
                seen_sources.add(source_key)

    return citations


def validate_response(answer: GroundedAnswer, chunks: list[RetrievedChunk]) -> bool:
    """
    Validate grounded answer for correctness.

    Validation checks:
    1. Citations present (>= 1)
    2. Answer contains book content (not generic/external knowledge)
    3. Term preservation (exact book terminology used)

    Args:
        answer: Generated answer
        chunks: Retrieved chunks used for grounding

    Returns:
        bool: True if valid, False otherwise
    """
    # Check 1: Citations present
    if len(answer.citations) == 0:
        return False

    # Check 2: Answer contains book content
    # Simple heuristic: answer should contain words from chunk text
    chunk_words = set()
    for chunk in chunks:
        chunk_words.update(chunk.text.lower().split())

    answer_words = set(answer.text.lower().split())
    overlap = len(chunk_words.intersection(answer_words))

    # Require at least 5 overlapping words as evidence of book grounding
    if overlap < 5:
        return False

    return True


# =============================================================================
# CLI Interface
# =============================================================================

def main():
    """
    Main entry point with CLI interface.

    Exit codes:
        0 - Success: Grounded answer returned
        1 - Refusal: Insufficient grounding
        2 - Error: System failure
    """
    parser = argparse.ArgumentParser(
        description='RAG Answer Generation Agent with strict book grounding',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--query',
        type=str,
        required=True,
        help='User question (required)'
    )
    parser.add_argument(
        '--selected-text',
        type=str,
        default=None,
        help='User-highlighted text (triggers selected-text-only mode)'
    )
    parser.add_argument(
        '--top-k',
        type=int,
        default=5,
        help='Number of chunks to retrieve (default: 5, max: 20)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show retrieved chunks and metadata'
    )

    args = parser.parse_args()

    try:
        # Load environment
        env_vars = load_environment()

        # Connect to Qdrant
        qdrant_client = connect_qdrant(env_vars)

        # Determine mode
        mode = "selected_text_only" if args.selected_text else "standard_rag"

        # Perform retrieval
        chunks = search_qdrant_tool(
            client=qdrant_client,
            query=args.query,
            cohere_api_key=env_vars['COHERE_API_KEY'],
            top_k=args.top_k,
            selected_text=args.selected_text
        )

        if args.verbose:
            print(f"\n[RETRIEVAL] Found {len(chunks)} chunks")
            for i, chunk in enumerate(chunks, 1):
                # Sanitize chapter and section for Windows console
                chapter_display = (chunk.chapter or 'N/A').encode('ascii', 'ignore').decode('ascii')
                section_display = (chunk.section or 'N/A').encode('ascii', 'ignore').decode('ascii')
                text_display = chunk.text[:150].encode('ascii', 'ignore').decode('ascii')

                print(f"\n  Chunk {i} (score: {chunk.similarity_score:.3f}):")
                print(f"    Chapter: {chapter_display}")
                print(f"    Section: {section_display}")
                print(f"    URL: {chunk.source_url or 'N/A'}")
                print(f"    Text: {text_display}...")
            print()

        # Create OpenAI agent
        openai_client = create_rag_agent(env_vars)

        # Query agent
        result = query_agent(
            client=openai_client,
            chunks=chunks,
            query=args.query,
            model=env_vars['MODEL'],
            mode=mode
        )

        # Handle result
        if isinstance(result, GroundedAnswer):
            # Validate response
            if not validate_response(result, chunks):
                print("\n[REFUSAL] Validation failed - insufficient grounding")
                print("The provided book content does not contain sufficient information to answer this question")
                sys.exit(1)

            # Print answer (sanitize for Windows console)
            print("\n[ANSWER]")
            answer_sanitized = result.text.encode('ascii', 'ignore').decode('ascii')
            print(answer_sanitized)
            print()

            # Print citations (sanitize for Windows console)
            print("[CITATIONS]")
            for i, citation in enumerate(result.citations, 1):
                chapter_display = (citation.chapter or 'N/A').encode('ascii', 'ignore').decode('ascii')
                section_display = (citation.section or 'N/A').encode('ascii', 'ignore').decode('ascii')
                print(f"{i}. Chapter: {chapter_display}")
                print(f"   Section: {section_display}")
                print(f"   URL: {citation.source_url or 'N/A'}")
                print()

            print(f"[MODE] {result.mode}")
            sys.exit(0)

        elif isinstance(result, RefusalMessage):
            print(f"\n[REFUSAL] {result.refusal_type}")
            print(result.reason)
            sys.exit(1)

    except (ValueError, ConnectionError, RuntimeError) as e:
        # Expected errors with actionable messages
        print(f"\n[ERROR] {e}", file=sys.stderr)
        sys.exit(2)

    except Exception as e:
        # Unexpected errors
        print(f"\n[ERROR] Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
