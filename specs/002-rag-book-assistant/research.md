# Research & Technical Decisions: RAG Book Assistant Ingestion

**Date**: 2025-12-25
**Phase**: Phase 0 - Content Ingestion Pipeline
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing the RAG book assistant content ingestion pipeline. All "NEEDS CLARIFICATION" items from the plan have been resolved through research and reasoned defaults.

---

## Decision 1: Chunking Strategy for Technical Content

### Research Question
What is the optimal chunk size and overlap strategy for technical textbook content to balance context preservation with retrieval precision?

### Options Considered

| Option | Chunk Size | Overlap | Pros | Cons |
|--------|-----------|---------|------|------|
| Small chunks | 200-300 tokens | 50 tokens | Precise retrieval, focused answers | May lose context, more chunks to manage |
| Medium chunks | 500-700 tokens | 100 tokens | Good balance, preserves paragraph context | Moderate storage, may include irrelevant text |
| Large chunks | 1000-1500 tokens | 200 tokens | Maximum context, fewer chunks | Less precise retrieval, higher costs |

### Decision

**Chunk Size**: 512 tokens (~400 words, ~2000 characters)
**Overlap**: 128 tokens (~100 words, ~500 characters)
**Method**: Token-based chunking using tiktoken (OpenAI tokenizer)

### Rationale

1. **Technical content characteristics**: Textbook explanations often span 2-4 paragraphs (300-600 words). 512 tokens captures complete explanations without excessive noise.

2. **Embedding model limits**: Cohere's `embed-english-v3.0` supports up to 512 tokens input, making this the natural upper bound.

3. **Overlap justification**: 128-token overlap (25%) ensures that concepts split across chunk boundaries are preserved in at least one complete chunk. Research shows 20-30% overlap reduces context loss significantly.

4. **Token-based vs character-based**: Token-based chunking respects semantic units better than character-based (e.g., doesn't split mid-word or mid-sentence in edge cases). Using tiktoken ensures consistency with embedding model tokenization.

### Implementation Notes

```python
import tiktoken

def chunk_text(text: str, chunk_size: int = 512, overlap: int = 128) -> list[str]:
    """
    Chunk text into token-based segments with overlap.

    Args:
        text: Input text to chunk
        chunk_size: Target chunk size in tokens (default 512)
        overlap: Overlap between chunks in tokens (default 128)

    Returns:
        List of text chunks
    """
    encoder = tiktoken.get_encoding("cl100k_base")  # GPT-4 tokenizer
    tokens = encoder.encode(text)

    chunks = []
    start = 0
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_text = encoder.decode(chunk_tokens)
        chunks.append(chunk_text)
        start += (chunk_size - overlap)

    return chunks
```

### Alternatives Rejected

- **Sentence-based chunking**: Too variable (1-50 tokens per sentence in technical content)
- **Fixed character chunking**: Ignores token boundaries, may exceed embedding limits
- **Semantic chunking (ML-based)**: Adds complexity and dependency on additional models

### References

- Cohere Embedding API Docs: https://docs.cohere.com/docs/embeddings
- LangChain Text Splitting Guide: https://python.langchain.com/docs/modules/data_connection/document_transformers/
- Research: "Optimal Chunk Size for RAG Systems" (various blog posts converge on 256-512 tokens for technical content)

---

## Decision 2: Cohere Embedding Model Selection

### Research Question
Which Cohere embedding model provides the best trade-off between accuracy, cost, and dimensionality for technical textbook content?

### Options Considered

| Model | Dimensions | Cost (per 1M tokens) | Context Length | Best For |
|-------|-----------|---------------------|----------------|----------|
| `embed-english-v3.0` | 1024 | $0.10 | 512 tokens | General English text, high accuracy |
| `embed-english-light-v3.0` | 384 | $0.10 | 512 tokens | Lower dimensions, faster retrieval |
| `embed-multilingual-v3.0` | 1024 | $0.10 | 512 tokens | Multi-language support (English + Urdu) |

### Decision

**Model**: `embed-multilingual-v3.0`
**Dimensions**: 1024
**Input Type**: `search_document` (for ingestion), `search_query` (for retrieval)

### Rationale

1. **Urdu support requirement**: The textbook constitution (Principle V) explicitly requires Urdu translation support. Using the multilingual model future-proofs the system for when Urdu content is added.

2. **No cost penalty**: Cohere prices all v3 models identically ($0.10 per 1M tokens), so choosing multilingual has no financial downside.

3. **Dimensionality**: 1024 dimensions provides superior accuracy for technical content compared to 384-dim light model. Storage cost difference is negligible (Qdrant free tier supports millions of 1024-dim vectors).

4. **Input types**: Cohere v3 models support separate optimization for documents vs queries. We'll use `search_document` during ingestion and `search_query` during retrieval for optimal semantic matching.

### Implementation Notes

```python
import cohere

co = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))

def embed_chunks(chunks: list[str]) -> list[list[float]]:
    """
    Generate embeddings for text chunks using Cohere.

    Args:
        chunks: List of text chunks

    Returns:
        List of embedding vectors (1024-dim each)
    """
    response = co.embed(
        texts=chunks,
        model="embed-multilingual-v3.0",
        input_type="search_document",  # Optimized for document storage
        embedding_types=["float"]
    )
    return response.embeddings.float
```

### Alternatives Rejected

- **`embed-english-v3.0`**: No Urdu support, same cost
- **`embed-english-light-v3.0`**: Lower accuracy, insufficient for technical content
- **OpenAI text-embedding-3-small**: More expensive ($0.02 per 1M tokens but requires more tokens), no Urdu optimization
- **Sentence-transformers (self-hosted)**: Requires GPU infrastructure, deployment complexity

### References

- Cohere Embed v3 Announcement: https://cohere.com/blog/introducing-embed-v3
- Cohere Pricing: https://cohere.com/pricing
- Multilingual Model Performance: https://docs.cohere.com/docs/multilingual-language-models

---

## Decision 3: URL Discovery Strategy

### Research Question
How should we crawl the GitHub Pages textbook to discover all chapter/section URLs?

### Options Considered

| Option | Complexity | Reliability | Maintenance |
|--------|-----------|-------------|-------------|
| Sitemap.xml parsing | Low | High (if sitemap exists) | Low (automatic updates) |
| Recursive link crawling | Medium | Medium (may miss pages) | Medium (must handle infinite loops) |
| Hardcoded URL patterns | Low | Low (breaks on structure changes) | High (manual updates) |
| GitHub repo file scan | Medium | High | Low (requires repo access) |

### Decision

**Primary**: Sitemap.xml parsing
**Fallback**: Recursive link crawling from homepage

### Rationale

1. **Docusaurus default**: Docusaurus automatically generates `sitemap.xml` during build, available at `https://shumailaaijaz.github.io/physical-ai-textbook/sitemap.xml`.

2. **Completeness**: Sitemap includes all public pages, ensuring we don't miss chapters.

3. **Metadata**: Sitemap includes last-modified dates, enabling future incremental update detection.

4. **Fallback robustness**: If sitemap is unavailable (unlikely), recursive crawling from homepage ensures we still get content.

### Implementation Notes

```python
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def get_all_urls(base_url: str) -> list[str]:
    """
    Discover all URLs from the textbook using sitemap.xml.
    Falls back to recursive crawling if sitemap unavailable.

    Args:
        base_url: Root URL (e.g., https://shumailaaijaz.github.io/physical-ai-textbook/)

    Returns:
        List of absolute URLs to crawl
    """
    sitemap_url = urljoin(base_url, "sitemap.xml")

    try:
        # Try sitemap first
        response = httpx.get(sitemap_url, timeout=10.0)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "xml")
        urls = [loc.text for loc in soup.find_all("loc")]
        return urls

    except Exception as e:
        print(f"Sitemap parsing failed: {e}. Falling back to crawling.")
        return crawl_recursive(base_url)

def crawl_recursive(base_url: str, max_depth: int = 3) -> list[str]:
    """Fallback: Recursively crawl pages from homepage."""
    visited = set()
    to_visit = [(base_url, 0)]
    base_domain = urlparse(base_url).netloc

    while to_visit:
        url, depth = to_visit.pop(0)
        if url in visited or depth > max_depth:
            continue

        visited.add(url)

        try:
            response = httpx.get(url, timeout=10.0)
            soup = BeautifulSoup(response.content, "html.parser")

            for link in soup.find_all("a", href=True):
                abs_url = urljoin(url, link["href"])
                if urlparse(abs_url).netloc == base_domain:
                    to_visit.append((abs_url, depth + 1))
        except:
            continue

    return list(visited)
```

### Alternatives Rejected

- **Hardcoded URLs**: Brittle, requires manual updates for every new chapter
- **GitHub API**: Unnecessary complexity, adds authentication requirement

### References

- Docusaurus Sitemap Plugin: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap
- XML Sitemap Format: https://www.sitemaps.org/protocol.html

---

## Decision 4: Metadata Extraction from HTML

### Research Question
How do we extract chapter titles, section headings, and other metadata from Docusaurus HTML pages?

### Decision

**Approach**: CSS selector-based extraction using BeautifulSoup
**Selectors**:
- Chapter title: `article h1` or `meta[property="og:title"]`
- Section headings: `article h2, article h3`
- Breadcrumb navigation: `nav.breadcrumbs a`
- Main content: `article.markdown` or `main`

### Rationale

1. **Docusaurus structure**: Docusaurus uses consistent semantic HTML with predictable class names and article tags.

2. **Multiple fallbacks**: Try multiple selectors to handle edge cases (e.g., custom theme modifications).

3. **Metadata preservation**: Breadcrumb navigation provides chapter/section hierarchy even if headings are ambiguous.

### Implementation Notes

```python
def extract_text_from_url(url: str) -> dict:
    """
    Fetch and parse HTML from URL, extracting clean text and metadata.

    Args:
        url: URL to fetch

    Returns:
        Dict with keys: text, chapter, section, url
    """
    response = httpx.get(url, timeout=10.0)
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
    main_content = soup.select_one("article.markdown") or soup.select_one("main")
    if main_content:
        # Remove script, style, nav elements
        for tag in main_content(["script", "style", "nav", "footer"]):
            tag.decompose()

        text = main_content.get_text(separator=" ", strip=True)
    else:
        text = ""

    return {
        "text": text,
        "chapter": chapter,
        "section": section,
        "url": url
    }
```

### Alternatives Rejected

- **Regex parsing**: Fragile, doesn't handle nested HTML
- **Readability library**: Overkill for structured Docusaurus content
- **LLM-based extraction**: Slow, expensive, unnecessary for structured data

### References

- BeautifulSoup Documentation: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- Docusaurus Theme Classic Structure: https://docusaurus.io/docs/styling-layout

---

## Decision 5: Qdrant Collection Schema

### Research Question
What vector dimensionality, distance metric, and payload schema should we use for the Qdrant collection?

### Decision

**Collection Name**: `rag_embeddings` (existing, as specified by user)
**Vector Config**:
- Dimensions: 1024 (matches Cohere embed-multilingual-v3.0)
- Distance metric: Cosine similarity
- On-disk storage: False (use in-memory for free tier performance)

**Payload Schema**:
```json
{
  "text": "string (chunk content)",
  "source_url": "string (original page URL)",
  "chapter": "string | null (chapter title)",
  "section": "string | null (section heading)",
  "chunk_index": "integer (position in document, 0-based)",
  "char_start": "integer (character offset in original text)",
  "char_end": "integer (character offset in original text)",
  "ingestion_timestamp": "string (ISO 8601 datetime)"
}
```

### Rationale

1. **Cosine similarity**: Standard for text embeddings, measures semantic similarity regardless of vector magnitude.

2. **Payload design**: Includes all metadata needed for:
   - Source attribution (chapter, section, URL)
   - Chunk reconstruction (char_start, char_end)
   - Debugging and auditing (chunk_index, timestamp)

3. **No HNSW tuning**: Use Qdrant defaults (ef_construct=100, m=16) for free tier. Optimization deferred to Phase 1 if needed.

### Implementation Notes

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import uuid

def create_collection(client: QdrantClient):
    """
    Create or recreate Qdrant collection with proper schema.
    """
    collection_name = "rag_embeddings"

    # Delete if exists (for clean re-ingestion)
    try:
        client.delete_collection(collection_name)
    except:
        pass

    # Create collection
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=1024,  # Cohere multilingual dimensions
            distance=Distance.COSINE
        )
    )

def save_chunk_to_qdrant(
    client: QdrantClient,
    chunk: str,
    embedding: list[float],
    metadata: dict
):
    """
    Upsert a single chunk with embedding to Qdrant.

    Args:
        client: Qdrant client instance
        chunk: Text chunk content
        embedding: 1024-dim embedding vector
        metadata: Dict with source_url, chapter, section, chunk_index, etc.
    """
    point_id = str(uuid.uuid4())

    point = PointStruct(
        id=point_id,
        vector=embedding,
        payload={
            "text": chunk,
            **metadata,
            "ingestion_timestamp": datetime.utcnow().isoformat()
        }
    )

    client.upsert(
        collection_name="rag_embeddings",
        points=[point]
    )
```

### Alternatives Rejected

- **Euclidean distance**: Less suitable for normalized embeddings
- **Dot product**: Requires normalized vectors, cosine is more robust
- **Separate collections per chapter**: Over-engineering, single collection simplifies queries

### References

- Qdrant Distance Metrics: https://qdrant.tech/documentation/concepts/search/
- Qdrant Python Client: https://github.com/qdrant/qdrant-client
- Cohere Embedding Best Practices: https://docs.cohere.com/docs/embeddings-best-practices

---

## Decision 6: Rate Limiting & Error Handling

### Research Question
How do we handle API rate limits from Cohere and ensure reliable ingestion even with network failures?

### Decision

**Cohere Rate Limiting**:
- Trial tier: 100 API calls/minute
- Batch size: 96 chunks per request (Cohere supports up to 96 texts per embed call)
- Wait strategy: Sleep 60s after hitting rate limit (detected by HTTP 429)

**Error Handling**:
- Retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
- Progress persistence: Save checkpoint after every 100 chunks
- Resume capability: Skip already-processed URLs on restart

### Implementation Notes

```python
import time
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10)
)
def embed_with_retry(co: cohere.Client, chunks: list[str]) -> list[list[float]]:
    """
    Call Cohere embed API with retry logic.
    """
    try:
        response = co.embed(
            texts=chunks,
            model="embed-multilingual-v3.0",
            input_type="search_document"
        )
        return response.embeddings.float
    except cohere.CohereAPIError as e:
        if e.status_code == 429:  # Rate limit
            print("Rate limit hit, waiting 60 seconds...")
            time.sleep(60)
            raise  # Trigger retry
        else:
            raise

def save_progress(checkpoint_file: str, processed_urls: set[str]):
    """Save checkpoint of processed URLs."""
    with open(checkpoint_file, "w") as f:
        json.dump(list(processed_urls), f)

def load_progress(checkpoint_file: str) -> set[str]:
    """Load checkpoint to resume interrupted ingestion."""
    if os.path.exists(checkpoint_file):
        with open(checkpoint_file, "r") as f:
            return set(json.load(f))
    return set()
```

### Rationale

1. **Batch processing**: Embedding 96 chunks at once maximizes throughput while staying under rate limits.

2. **Exponential backoff**: Standard retry pattern prevents overwhelming the API during transient failures.

3. **Checkpointing**: Enables resumption if ingestion crashes mid-way (e.g., laptop sleep, network failure).

### Alternatives Rejected

- **No rate limiting**: Would fail on large textbooks
- **Sequential processing (1 chunk at a time)**: 96x slower, unnecessary
- **Database-backed progress**: Over-engineering for Phase 0

### References

- Cohere Rate Limits: https://docs.cohere.com/docs/going-live#rate-limits
- Tenacity Retry Library: https://tenacity.readthedocs.io/

---

## Decision 7: Incremental Updates

### Research Question
Should Phase 0 support incremental updates (re-ingesting only changed pages), or only full re-ingestion?

### Decision

**Phase 0**: Full re-ingestion only (delete collection, re-process all URLs)
**Phase 1**: Add incremental update support using sitemap last-modified dates

### Rationale

1. **Textbook update frequency**: Textbooks are updated infrequently (weeks/months), making full re-ingestion acceptable for initial launch.

2. **Simplicity**: Incremental updates require:
   - Comparing last-modified dates from sitemap
   - Deleting old chunks for changed pages
   - Merging new chunks without duplicates
   - Tracking chunk IDs to page URLs

   This adds significant complexity for minimal Phase 0 benefit.

3. **Phase 1 priority**: Once the query API is working, incremental updates become more valuable (avoiding downtime during re-ingestion).

### Implementation Notes (Phase 1 Roadmap)

```python
# Future implementation sketch
def incremental_update(client: QdrantClient, base_url: str):
    """
    Update only changed pages based on sitemap last-modified dates.
    """
    # 1. Fetch current sitemap
    sitemap = fetch_sitemap(base_url)

    # 2. Load last ingestion timestamps from Qdrant metadata
    existing_pages = get_ingested_pages(client)

    # 3. Compare last-modified dates
    changed_urls = [
        url for url, last_mod in sitemap.items()
        if url not in existing_pages or last_mod > existing_pages[url]["timestamp"]
    ]

    # 4. Delete old chunks for changed pages
    for url in changed_urls:
        client.delete(
            collection_name="rag_embeddings",
            points_selector={"must": [{"key": "source_url", "match": {"value": url}}]}
        )

    # 5. Re-ingest changed pages
    ingest_urls(client, changed_urls)
```

### Alternatives Rejected

- **Implement incremental updates in Phase 0**: Delays delivery, unnecessary complexity
- **No incremental updates ever**: Would require full re-ingestion for every minor textbook edit (hours of processing)

### References

- Qdrant Delete by Filter: https://qdrant.tech/documentation/concepts/points/#delete-points
- Sitemap lastmod Element: https://www.sitemaps.org/protocol.html#lastmoddef

---

## Technology Stack Summary

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Package Manager | UV | Latest | Modern Python tooling, fast, built-in lock files |
| HTTP Client | httpx | 0.27+ | Async support, modern API, timeout handling |
| HTML Parser | BeautifulSoup4 | 4.12+ | Industry standard, robust selector support |
| XML Parser | lxml | 5.0+ | Fast XML parsing for sitemap.xml |
| Tokenizer | tiktoken | 0.7+ | OpenAI tokenizer, matches Cohere expectations |
| Embedding API | Cohere | Latest SDK | Multilingual support, cost-effective |
| Vector DB | Qdrant | Latest client | Open-source, generous free tier |
| Environment Config | python-dotenv | 1.0+ | Standard for .env file management |
| Data Validation | Pydantic | 2.0+ | Type safety for metadata structures |
| Retry Logic | tenacity | 8.0+ | Robust retry patterns |
| Testing | pytest | 8.0+ | De facto standard for Python testing |

---

## Environment Variables Required

```bash
# .env file structure
COHERE_API_KEY=<cohere-api-key>
QDRANT_URL=<qdrant-cluster-url>
QDRANT_API_KEY=<qdrant-api-key>
TEXTBOOK_BASE_URL=https://shumailaaijaz.github.io/physical-ai-textbook/
CHUNK_SIZE=512
CHUNK_OVERLAP=128
BATCH_SIZE=96
```

---

## Next Steps

1. ✅ All technical decisions documented
2. → Proceed to `data-model.md` (formalize entity schemas)
3. → Proceed to `quickstart.md` (setup and execution guide)
4. → Run `/sp.tasks` to generate implementation tasks
5. → Implement `main.py` with all functions

---

## References

- Cohere Documentation: https://docs.cohere.com/
- Qdrant Documentation: https://qdrant.tech/documentation/
- Docusaurus Documentation: https://docusaurus.io/docs
- BeautifulSoup Documentation: https://www.crummy.com/software/BeautifulSoup/
- RAG Best Practices: https://python.langchain.com/docs/use_cases/question_answering/
