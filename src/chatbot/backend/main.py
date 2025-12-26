"""
RAG Book Assistant - Content Ingestion Pipeline

This script ingests content from a deployed textbook (GitHub Pages), chunks the text,
generates embeddings using Cohere, and stores them in Qdrant vector database.

Functions:
    - get_all_urls(): Discover all URLs from sitemap.xml
    - extract_text_from_url(): Parse HTML and extract clean text with metadata
    - chunk_text(): Split text into token-based chunks with overlap
    - embed(): Generate embeddings using Cohere API
    - create_collection(): Setup Qdrant collection
    - save_chunk_to_qdrant(): Upsert chunks to Qdrant
    - main(): Orchestrate the full ingestion pipeline

Usage:
    python main.py
"""

import os
import sys
import json
import time
import logging
from datetime import datetime
from typing import List, Dict, Optional, Any
from urllib.parse import urljoin, urlparse
import uuid

# Third-party imports
import httpx
from bs4 import BeautifulSoup
import tiktoken
import cohere
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, PayloadSchemaType
from pydantic import BaseModel, Field, validator, HttpUrl
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
TEXTBOOK_BASE_URL = os.getenv("TEXTBOOK_BASE_URL", "https://shumailaaijaz.github.io/physical-ai-textbook/")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "512"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "128"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "96"))
COLLECTION_NAME = "rag_embeddings"
CHECKPOINT_FILE = "ingestion_checkpoint.json"


# ============================================================================
# Pydantic Models (Phase 4)
# ============================================================================

class BookPage(BaseModel):
    """Raw page data fetched from textbook URL."""

    url: HttpUrl
    raw_html: str
    chapter: Optional[str] = None
    section: Optional[str] = None
    clean_text: str
    fetch_timestamp: str


class TextChunk(BaseModel):
    """A single chunk of text ready for embedding."""

    chunk_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str = Field(..., min_length=1)
    source_url: str
    chapter: Optional[str] = None
    section: Optional[str] = None
    chunk_index: int = Field(..., ge=0)
    char_start: int = Field(..., ge=0)
    char_end: int = Field(..., ge=0)
    token_count: int = Field(..., ge=1)

    @validator("char_end")
    def validate_char_range(cls, v, values):
        """Ensure char_end > char_start."""
        if "char_start" in values and v <= values["char_start"]:
            raise ValueError("char_end must be greater than char_start")
        return v

    @validator("token_count")
    def validate_token_count(cls, v):
        """Ensure chunk doesn't exceed embedding model limit."""
        if v > 512:
            raise ValueError(f"Token count {v} exceeds Cohere limit of 512")
        return v

    @validator("text")
    def validate_text_not_empty(cls, v):
        """Ensure chunk text is not empty or whitespace-only."""
        if not v.strip():
            raise ValueError("Chunk text cannot be empty")
        return v


class EmbeddedChunk(TextChunk):
    """TextChunk with embedding vector attached."""

    embedding: List[float] = Field(..., min_length=1024, max_length=1024)
    embedding_model: str = "embed-multilingual-v3.0"


# ============================================================================
# Core Functions (Phase 2)
# ============================================================================

def get_all_urls(base_url: str) -> List[str]:
    """
    Discover all URLs from the textbook using sitemap.xml.
    Falls back to recursive crawling if sitemap unavailable.

    Args:
        base_url: Root URL (e.g., https://example.com/textbook/)

    Returns:
        List of absolute URLs to crawl

    Example:
        >>> urls = get_all_urls("https://example.com/textbook/")
        >>> len(urls)
        87
    """
    logger.info(f"Fetching URLs from sitemap.xml...")
    sitemap_url = urljoin(base_url, "sitemap.xml")

    try:
        # Try sitemap first
        response = httpx.get(sitemap_url, timeout=10.0, follow_redirects=True)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "xml")
        urls = [loc.text for loc in soup.find_all("loc")]

        logger.info(f"Found {len(urls)} URLs from sitemap.xml")
        return urls

    except Exception as e:
        logger.warning(f"Sitemap parsing failed: {e}. Falling back to crawling.")
        return _crawl_recursive(base_url)


def _crawl_recursive(base_url: str, max_depth: int = 3) -> List[str]:
    """
    Fallback: Recursively crawl pages from homepage.

    Args:
        base_url: Root URL to start crawling
        max_depth: Maximum depth to crawl (default 3)

    Returns:
        List of discovered URLs
    """
    logger.info(f"Crawling site recursively (max depth: {max_depth})...")
    visited = set()
    to_visit = [(base_url, 0)]
    base_domain = urlparse(base_url).netloc

    while to_visit:
        url, depth = to_visit.pop(0)
        if url in visited or depth > max_depth:
            continue

        visited.add(url)

        try:
            response = httpx.get(url, timeout=10.0, follow_redirects=True)
            soup = BeautifulSoup(response.content, "html.parser")

            for link in soup.find_all("a", href=True):
                abs_url = urljoin(url, link["href"])
                if urlparse(abs_url).netloc == base_domain and abs_url not in visited:
                    to_visit.append((abs_url, depth + 1))

        except Exception as e:
            logger.warning(f"Failed to crawl {url}: {e}")
            continue

    logger.info(f"Found {len(visited)} URLs via recursive crawling")
    return list(visited)


def extract_text_from_url(url: str) -> Dict[str, Any]:
    """
    Fetch and parse HTML from URL, extracting clean text and metadata.

    Args:
        url: URL to fetch

    Returns:
        Dict with keys: text, chapter, section, url

    Example:
        >>> data = extract_text_from_url("https://example.com/chapter-1")
        >>> data['chapter']
        'Chapter 1: Introduction'
    """
    try:
        response = httpx.get(url, timeout=10.0, follow_redirects=True)
        response.raise_for_status()
    except Exception as e:
        logger.error(f"Failed to fetch {url}: {e}")
        return {"text": "", "chapter": None, "section": None, "url": url}

    soup = BeautifulSoup(response.content, "html.parser")

    # Extract chapter title
    chapter = None
    if title_tag := soup.find("meta", property="og:title"):
        chapter = title_tag.get("content")
    elif h1 := soup.select_one("article h1"):
        chapter = h1.get_text(strip=True)

    # Extract section (first h2 or breadcrumb)
    section = None
    if breadcrumbs := soup.select("nav.breadcrumbs a"):
        section = breadcrumbs[-1].get_text(strip=True) if len(breadcrumbs) > 1 else None
    elif h2 := soup.select_one("article h2"):
        section = h2.get_text(strip=True)

    # Extract clean text (remove nav, footer, ads)
    main_content = soup.select_one("article.markdown") or soup.select_one("main") or soup.select_one("article")

    if main_content:
        # Remove script, style, nav elements
        for tag in main_content(["script", "style", "nav", "footer"]):
            tag.decompose()

        text = main_content.get_text(separator=" ", strip=True)
    else:
        text = soup.get_text(separator=" ", strip=True)

    return {
        "text": text,
        "chapter": chapter,
        "section": section,
        "url": url
    }


def chunk_text(text: str, source_url: str, chapter: Optional[str], section: Optional[str]) -> List[TextChunk]:
    """
    Chunk text into token-based segments with overlap.

    Args:
        text: Input text to chunk
        source_url: Original page URL
        chapter: Chapter title
        section: Section heading

    Returns:
        List of TextChunk objects

    Example:
        >>> chunks = chunk_text("Long text...", "https://example.com", "Chapter 1", "Intro")
        >>> len(chunks)
        5
    """
    encoder = tiktoken.get_encoding("cl100k_base")
    tokens = encoder.encode(text)

    chunks = []
    start = 0
    chunk_index = 0

    while start < len(tokens):
        end = start + CHUNK_SIZE
        chunk_tokens = tokens[start:end]

        # Decode chunk
        chunk_text = encoder.decode(chunk_tokens)

        # Calculate character positions (approximate)
        char_start = len(encoder.decode(tokens[:start]))
        char_end = char_start + len(chunk_text)

        # Create chunk object
        chunk = TextChunk(
            text=chunk_text,
            source_url=source_url,
            chapter=chapter,
            section=section,
            chunk_index=chunk_index,
            char_start=char_start,
            char_end=char_end,
            token_count=len(chunk_tokens)
        )

        chunks.append(chunk)
        chunk_index += 1
        start += (CHUNK_SIZE - CHUNK_OVERLAP)

    return chunks


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type(Exception)
)
def embed(chunks: List[TextChunk], cohere_client: cohere.Client) -> List[EmbeddedChunk]:
    """
    Generate embeddings for text chunks using Cohere.

    Args:
        chunks: List of TextChunk objects
        cohere_client: Initialized Cohere client

    Returns:
        List of EmbeddedChunk objects with embeddings

    Raises:
        Exception: If embedding generation fails after retries
    """
    texts = [chunk.text for chunk in chunks]

    try:
        response = cohere_client.embed(
            texts=texts,
            model="embed-multilingual-v3.0",
            input_type="search_document",
            embedding_types=["float"]
        )

        embeddings = response.embeddings.float

        # Combine chunks with embeddings
        embedded_chunks = []
        for chunk, embedding in zip(chunks, embeddings):
            embedded_chunk = EmbeddedChunk(
                **chunk.dict(),
                embedding=embedding
            )
            embedded_chunks.append(embedded_chunk)

        return embedded_chunks

    except cohere.CohereAPIError as e:
        if e.status_code == 429:  # Rate limit
            logger.warning("Rate limit hit, waiting 60 seconds...")
            time.sleep(60)
            raise  # Trigger retry
        else:
            logger.error(f"Cohere API error: {e}")
            raise


def create_collection(qdrant_client: QdrantClient):
    """
    Create or recreate Qdrant collection with proper schema.

    Args:
        qdrant_client: Initialized Qdrant client
    """
    logger.info(f"Setting up Qdrant collection '{COLLECTION_NAME}'...")

    # Delete existing collection (clean slate for Phase 0)
    try:
        qdrant_client.delete_collection(COLLECTION_NAME)
        logger.info(f"Deleted existing collection: {COLLECTION_NAME}")
    except Exception:
        logger.info(f"Collection does not exist yet, creating new...")

    # Create new collection
    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=1024,  # Cohere embed-multilingual-v3.0 dimensions
            distance=Distance.COSINE
        )
    )

    # Create payload indexes for faster filtering
    qdrant_client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="source_url",
        field_schema=PayloadSchemaType.KEYWORD
    )

    qdrant_client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="chapter",
        field_schema=PayloadSchemaType.KEYWORD
    )

    qdrant_client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="section",
        field_schema=PayloadSchemaType.KEYWORD
    )

    logger.info(f"✅ Collection '{COLLECTION_NAME}' created with indexes")


def save_chunk_to_qdrant(chunk: EmbeddedChunk, qdrant_client: QdrantClient):
    """
    Upsert a single chunk with embedding to Qdrant.

    Args:
        chunk: EmbeddedChunk with text, metadata, and embedding
        qdrant_client: Initialized Qdrant client
    """
    point = PointStruct(
        id=chunk.chunk_id,
        vector=chunk.embedding,
        payload={
            "text": chunk.text,
            "source_url": chunk.source_url,
            "chapter": chunk.chapter,
            "section": chunk.section,
            "chunk_index": chunk.chunk_index,
            "char_start": chunk.char_start,
            "char_end": chunk.char_end,
            "token_count": chunk.token_count,
            "embedding_model": chunk.embedding_model,
            "ingestion_timestamp": datetime.utcnow().isoformat()
        }
    )

    try:
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=[point]
        )
    except Exception as e:
        logger.error(f"Failed to upsert chunk {chunk.chunk_id}: {e}")
        raise


# ============================================================================
# Progress Tracking (Phase 3)
# ============================================================================

def save_progress(checkpoint_file: str, processed_urls: set):
    """Save checkpoint of processed URLs."""
    try:
        with open(checkpoint_file, "w") as f:
            json.dump(list(processed_urls), f, indent=2)
        logger.debug(f"Checkpoint saved: {len(processed_urls)} URLs processed")
    except Exception as e:
        logger.warning(f"Failed to save checkpoint: {e}")


def load_progress(checkpoint_file: str) -> set:
    """Load checkpoint to resume interrupted ingestion."""
    if os.path.exists(checkpoint_file):
        try:
            with open(checkpoint_file, "r") as f:
                urls = json.load(f)
            logger.info(f"Resuming from checkpoint: {len(urls)} URLs already processed")
            return set(urls)
        except Exception as e:
            logger.warning(f"Failed to load checkpoint: {e}")

    return set()


# ============================================================================
# Main Orchestration (Phase 3)
# ============================================================================

def main():
    """
    Main ingestion pipeline orchestration.

    Steps:
        1. Load environment and initialize clients
        2. Setup Qdrant collection
        3. Discover URLs from sitemap
        4. For each URL:
           - Extract text and metadata
           - Chunk text
           - Generate embeddings
           - Save to Qdrant
        5. Report completion statistics
    """
    start_time = time.time()

    # Validate environment
    if not COHERE_API_KEY or not QDRANT_URL or not QDRANT_API_KEY:
        logger.error("Missing required environment variables. Check .env file.")
        logger.error("Required: COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY")
        sys.exit(1)

    logger.info("=" * 60)
    logger.info("RAG Book Assistant - Content Ingestion Pipeline")
    logger.info("=" * 60)
    logger.info(f"Textbook URL: {TEXTBOOK_BASE_URL}")
    logger.info(f"Chunk size: {CHUNK_SIZE} tokens")
    logger.info(f"Chunk overlap: {CHUNK_OVERLAP} tokens")
    logger.info(f"Batch size: {BATCH_SIZE} chunks")
    logger.info("=" * 60)

    # Initialize clients
    try:
        cohere_client = cohere.Client(api_key=COHERE_API_KEY)
        qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        logger.info("✅ Clients initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize clients: {e}")
        sys.exit(1)

    # Setup Qdrant collection
    try:
        create_collection(qdrant_client)
    except Exception as e:
        logger.error(f"Failed to create collection: {e}")
        sys.exit(1)

    # Discover URLs
    try:
        all_urls = get_all_urls(TEXTBOOK_BASE_URL)
        if not all_urls:
            logger.error("No URLs discovered. Check TEXTBOOK_BASE_URL.")
            sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to discover URLs: {e}")
        sys.exit(1)

    # Load checkpoint
    processed_urls = load_progress(CHECKPOINT_FILE)
    urls_to_process = [url for url in all_urls if url not in processed_urls]

    logger.info(f"📄 Total URLs: {len(all_urls)}")
    logger.info(f"✅ Already processed: {len(processed_urls)}")
    logger.info(f"⏳ Remaining: {len(urls_to_process)}")
    logger.info("=" * 60)

    # Process each URL
    total_chunks = 0
    failed_urls = []

    for idx, url in enumerate(urls_to_process, 1):
        try:
            logger.info(f"[{idx}/{len(urls_to_process)}] Processing: {url}")

            # Extract text
            page_data = extract_text_from_url(url)

            if not page_data["text"] or len(page_data["text"]) < 100:
                logger.warning(f"  ⚠️  Skipping (insufficient text): {url}")
                processed_urls.add(url)
                continue

            logger.info(f"  📝 Extracted {len(page_data['text'])} characters")

            # Chunk text
            chunks = chunk_text(
                text=page_data["text"],
                source_url=url,
                chapter=page_data["chapter"],
                section=page_data["section"]
            )

            logger.info(f"  ✂️  Generated {len(chunks)} chunks")

            # Batch embed and save
            for batch_start in range(0, len(chunks), BATCH_SIZE):
                batch_end = min(batch_start + BATCH_SIZE, len(chunks))
                batch = chunks[batch_start:batch_end]

                # Embed batch
                try:
                    embedded_chunks = embed(batch, cohere_client)
                    logger.info(f"  🧮 Embedded chunks {batch_start+1}-{batch_end}")
                except Exception as e:
                    logger.error(f"  ❌ Embedding failed: {e}")
                    failed_urls.append(url)
                    break

                # Save to Qdrant
                for chunk in embedded_chunks:
                    try:
                        save_chunk_to_qdrant(chunk, qdrant_client)
                    except Exception as e:
                        logger.error(f"  ❌ Failed to save chunk: {e}")

                total_chunks += len(embedded_chunks)
                logger.info(f"  💾 Saved {len(embedded_chunks)} chunks to Qdrant")

            # Mark as processed
            processed_urls.add(url)

            # Save checkpoint every 10 URLs
            if idx % 10 == 0:
                save_progress(CHECKPOINT_FILE, processed_urls)

        except Exception as e:
            logger.error(f"❌ Failed to process {url}: {e}")
            failed_urls.append(url)

    # Final checkpoint
    save_progress(CHECKPOINT_FILE, processed_urls)

    # Report statistics
    elapsed_time = time.time() - start_time
    logger.info("=" * 60)
    logger.info("✅ Ingestion Complete!")
    logger.info("=" * 60)
    logger.info(f"📊 Statistics:")
    logger.info(f"   - Total URLs processed: {len(processed_urls)}")
    logger.info(f"   - Total chunks ingested: {total_chunks}")
    logger.info(f"   - Failed URLs: {len(failed_urls)}")
    logger.info(f"   - Total time: {elapsed_time/60:.1f} minutes")
    logger.info(f"   - Throughput: {total_chunks/(elapsed_time/60):.1f} chunks/minute")
    logger.info("=" * 60)

    if failed_urls:
        logger.warning(f"⚠️  {len(failed_urls)} URLs failed:")
        for url in failed_urls:
            logger.warning(f"   - {url}")

    logger.info(f"💾 Checkpoint saved to: {CHECKPOINT_FILE}")
    logger.info("🎉 Run verify_ingestion.py to check the data!")


if __name__ == "__main__":
    main()
