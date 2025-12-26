# Data Model: RAG Book Assistant

**Date**: 2025-12-25
**Phase**: Phase 0 - Content Ingestion Pipeline
**Status**: Complete

## Overview

This document defines the data structures, schemas, and relationships for the RAG Book Assistant ingestion pipeline and storage layer. All entities are designed to support the functional requirements from `spec.md`, particularly source attribution (FR-005), metadata preservation, and strict content boundaries.

---

## Entity Definitions

### 1. BookPage (Ephemeral - In-Memory Only)

Represents a single HTML page fetched from the deployed textbook before processing.

```python
from pydantic import BaseModel, HttpUrl
from typing import Optional

class BookPage(BaseModel):
    """Raw page data fetched from textbook URL."""

    url: HttpUrl
    """Absolute URL of the page (e.g., https://shumailaaijaz.github.io/physical-ai-textbook/chapter-1/intro)"""

    raw_html: str
    """Complete HTML content as fetched from the server"""

    chapter: Optional[str] = None
    """Chapter title extracted from HTML metadata (e.g., 'Chapter 1: Introduction to Robotics')"""

    section: Optional[str] = None
    """Section heading extracted from breadcrumbs or H2 tags (e.g., 'Kinematics Basics')"""

    clean_text: str
    """Extracted text content with HTML tags, scripts, and navigation removed"""

    fetch_timestamp: str
    """ISO 8601 timestamp of when the page was fetched"""
```

**Usage**: Created by `extract_text_from_url()`, consumed by `chunk_text()`, then discarded.

**Relationships**: One BookPage → Many TextChunks (1:N)

---

### 2. TextChunk (Ephemeral - In-Memory Only)

Represents a single chunk of text after tokenization and splitting, before embedding generation.

```python
from pydantic import BaseModel, Field
from typing import Optional

class TextChunk(BaseModel):
    """A single chunk of text ready for embedding."""

    chunk_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    """Unique identifier (UUID) for this chunk"""

    text: str = Field(..., min_length=1, max_length=10000)
    """Chunk content (typically 400-600 words, ~2000 characters)"""

    source_url: HttpUrl
    """Original page URL this chunk came from"""

    chapter: Optional[str] = None
    """Chapter title (inherited from BookPage)"""

    section: Optional[str] = None
    """Section heading (inherited from BookPage)"""

    chunk_index: int = Field(..., ge=0)
    """
    Position of this chunk within the source page (0-based).
    Example: Page with 3 chunks → chunk_index ∈ {0, 1, 2}
    """

    char_start: int = Field(..., ge=0)
    """Character offset where this chunk starts in the original clean_text"""

    char_end: int = Field(..., ge=0)
    """Character offset where this chunk ends in the original clean_text"""

    token_count: int = Field(..., ge=1)
    """Actual token count of this chunk (for validation and debugging)"""
```

**Usage**: Created by `chunk_text()`, consumed by `embed()` and `save_chunk_to_qdrant()`.

**Validation Rules**:
- `text` must not be empty
- `char_end` > `char_start`
- `token_count` ≤ 512 (Cohere embedding limit)
- `chunk_index` increments sequentially within a page

**Relationships**: One BookPage → Many TextChunks (1:N)

---

### 3. EmbeddedChunk (Ephemeral - In-Memory Only)

Extends TextChunk with the generated embedding vector, ready for Qdrant insertion.

```python
class EmbeddedChunk(TextChunk):
    """TextChunk with embedding vector attached."""

    embedding: list[float] = Field(..., min_length=1024, max_length=1024)
    """
    1024-dimensional embedding vector from Cohere embed-multilingual-v3.0.
    Type: float32 array.
    """

    embedding_model: str = "embed-multilingual-v3.0"
    """Model name used to generate this embedding (for version tracking)"""
```

**Usage**: Created by `embed()`, consumed by `save_chunk_to_qdrant()`.

**Validation Rules**:
- `embedding` must have exactly 1024 dimensions
- All embedding values must be finite floats (no NaN, no Inf)

---

### 4. QdrantPoint (Persistent - Qdrant Vector DB)

Represents the final stored format in Qdrant, combining vector + payload.

**Qdrant Collection Schema**:

```python
from qdrant_client.models import Distance, VectorParams

COLLECTION_CONFIG = {
    "collection_name": "rag_embeddings",
    "vectors_config": VectorParams(
        size=1024,                # Matches Cohere embed-multilingual-v3.0
        distance=Distance.COSINE  # Cosine similarity for semantic search
    )
}
```

**Point Structure**:

```python
from qdrant_client.models import PointStruct
from datetime import datetime

def to_qdrant_point(chunk: EmbeddedChunk) -> PointStruct:
    """Convert EmbeddedChunk to Qdrant point format."""
    return PointStruct(
        id=chunk.chunk_id,        # UUID string
        vector=chunk.embedding,   # 1024-dim float array
        payload={
            "text": chunk.text,
            "source_url": str(chunk.source_url),
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
```

**Payload Schema**:

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| `text` | string | Yes | No | Full chunk text content |
| `source_url` | string | Yes | Yes | Original page URL (for source attribution) |
| `chapter` | string | No | Yes | Chapter title (null if not extractable) |
| `section` | string | No | Yes | Section heading (null if not extractable) |
| `chunk_index` | integer | Yes | No | Position within source page (0-based) |
| `char_start` | integer | Yes | No | Character offset start in original text |
| `char_end` | integer | Yes | No | Character offset end in original text |
| `token_count` | integer | Yes | No | Actual token count of chunk |
| `embedding_model` | string | Yes | No | Model used for embedding (versioning) |
| `ingestion_timestamp` | string | Yes | No | ISO 8601 datetime of ingestion |

**Indexed Fields**: `source_url`, `chapter`, `section` (for filtering queries by book location)

---

## Data Flow Pipeline

```text
┌──────────────────┐
│  get_all_urls()  │ → List[str] (URLs from sitemap.xml)
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ extract_text_from_url()  │ → BookPage (per URL)
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│   chunk_text()   │ → List[TextChunk] (per BookPage)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     embed()      │ → List[EmbeddedChunk] (batch of chunks)
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ save_chunk_to_qdrant()  │ → QdrantPoint (persisted to DB)
└─────────────────────────┘
```

---

## Qdrant Collection Configuration

### Collection Creation

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

def create_collection(client: QdrantClient) -> None:
    """
    Create or recreate the rag_embeddings collection.

    WARNING: Deletes existing collection if present!
    """
    collection_name = "rag_embeddings"

    # Delete existing collection (clean slate for Phase 0)
    try:
        client.delete_collection(collection_name)
        print(f"Deleted existing collection: {collection_name}")
    except Exception:
        pass  # Collection doesn't exist, proceed

    # Create new collection
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=1024,                # Cohere embed-multilingual-v3.0 dimensions
            distance=Distance.COSINE  # Cosine similarity
        )
    )
    print(f"Created collection: {collection_name}")
```

### Index Configuration

```python
from qdrant_client.models import PayloadSchemaType

def create_payload_indexes(client: QdrantClient) -> None:
    """
    Create indexes on frequently filtered fields for faster queries.
    """
    collection_name = "rag_embeddings"

    # Index source_url for filtering by page
    client.create_payload_index(
        collection_name=collection_name,
        field_name="source_url",
        field_schema=PayloadSchemaType.KEYWORD
    )

    # Index chapter for filtering by chapter
    client.create_payload_index(
        collection_name=collection_name,
        field_name="chapter",
        field_schema=PayloadSchemaType.KEYWORD
    )

    # Index section for filtering by section
    client.create_payload_index(
        collection_name=collection_name,
        field_name="section",
        field_schema=PayloadSchemaType.KEYWORD
    )

    print("Created payload indexes for source_url, chapter, section")
```

---

## Example Data Instances

### Example BookPage

```python
BookPage(
    url="https://shumailaaijaz.github.io/physical-ai-textbook/chapter-4/vector-databases",
    raw_html="<html><head>...</head><body>...</body></html>",
    chapter="Chapter 4: Data Infrastructure for Physical AI",
    section="Vector Databases",
    clean_text="Vector databases are specialized systems designed to store and query high-dimensional vectors efficiently. Unlike traditional relational databases that store structured data in rows and columns, vector databases optimize for similarity search operations...",
    fetch_timestamp="2025-12-25T12:34:56Z"
)
```

### Example TextChunk

```python
TextChunk(
    chunk_id="a3f2c8e1-4b67-4d92-8e9f-1a2b3c4d5e6f",
    text="Vector databases are specialized systems designed to store and query high-dimensional vectors efficiently. Unlike traditional relational databases that store structured data in rows and columns, vector databases optimize for similarity search operations. Common use cases include semantic search, recommendation systems, and RAG (Retrieval-Augmented Generation) applications.",
    source_url="https://shumailaaijaz.github.io/physical-ai-textbook/chapter-4/vector-databases",
    chapter="Chapter 4: Data Infrastructure for Physical AI",
    section="Vector Databases",
    chunk_index=0,
    char_start=0,
    char_end=385,
    token_count=68
)
```

### Example EmbeddedChunk

```python
EmbeddedChunk(
    chunk_id="a3f2c8e1-4b67-4d92-8e9f-1a2b3c4d5e6f",
    text="Vector databases are specialized systems...",
    source_url="https://shumailaaijaz.github.io/physical-ai-textbook/chapter-4/vector-databases",
    chapter="Chapter 4: Data Infrastructure for Physical AI",
    section="Vector Databases",
    chunk_index=0,
    char_start=0,
    char_end=385,
    token_count=68,
    embedding=[0.023, -0.145, 0.678, ..., 0.234],  # 1024 floats
    embedding_model="embed-multilingual-v3.0"
)
```

### Example QdrantPoint Payload

```json
{
  "id": "a3f2c8e1-4b67-4d92-8e9f-1a2b3c4d5e6f",
  "vector": [0.023, -0.145, 0.678, "... (1024 floats)"],
  "payload": {
    "text": "Vector databases are specialized systems designed to store and query high-dimensional vectors efficiently. Unlike traditional relational databases that store structured data in rows and columns, vector databases optimize for similarity search operations. Common use cases include semantic search, recommendation systems, and RAG (Retrieval-Augmented Generation) applications.",
    "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/chapter-4/vector-databases",
    "chapter": "Chapter 4: Data Infrastructure for Physical AI",
    "section": "Vector Databases",
    "chunk_index": 0,
    "char_start": 0,
    "char_end": 385,
    "token_count": 68,
    "embedding_model": "embed-multilingual-v3.0",
    "ingestion_timestamp": "2025-12-25T12:35:42Z"
  }
}
```

---

## Query Patterns (Phase 1 Preview)

While Phase 0 focuses on ingestion, here are the expected query patterns for Phase 1:

### 1. Semantic Search (Standard Mode)

```python
from qdrant_client.models import SearchRequest

def semantic_search(query: str, client: QdrantClient, top_k: int = 5):
    """
    Search for chunks semantically similar to query.
    """
    # Generate query embedding
    query_embedding = co.embed(
        texts=[query],
        model="embed-multilingual-v3.0",
        input_type="search_query"  # Different from search_document!
    ).embeddings.float[0]

    # Search Qdrant
    results = client.search(
        collection_name="rag_embeddings",
        query_vector=query_embedding,
        limit=top_k
    )

    return results
```

### 2. Filtered Search by Chapter

```python
from qdrant_client.models import Filter, FieldCondition, MatchValue

def search_in_chapter(query: str, chapter: str, client: QdrantClient):
    """
    Search within a specific chapter only.
    """
    query_embedding = co.embed(
        texts=[query],
        model="embed-multilingual-v3.0",
        input_type="search_query"
    ).embeddings.float[0]

    results = client.search(
        collection_name="rag_embeddings",
        query_vector=query_embedding,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="chapter",
                    match=MatchValue(value=chapter)
                )
            ]
        ),
        limit=5
    )

    return results
```

---

## Data Validation Rules

### Ingestion-Time Validation

```python
from pydantic import validator

class TextChunk(BaseModel):
    # ... (fields as defined above)

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
```

### Post-Ingestion Validation

```python
def validate_collection(client: QdrantClient) -> dict:
    """
    Run validation checks on ingested data.

    Returns:
        Dict with validation results
    """
    collection_name = "rag_embeddings"

    # Get collection info
    info = client.get_collection(collection_name)
    total_points = info.points_count

    # Sample points for validation
    sample = client.scroll(
        collection_name=collection_name,
        limit=100,
        with_payload=True,
        with_vectors=False
    )[0]

    # Check for required fields
    missing_fields = []
    for point in sample:
        required = ["text", "source_url", "chunk_index", "ingestion_timestamp"]
        for field in required:
            if field not in point.payload:
                missing_fields.append((point.id, field))

    return {
        "total_points": total_points,
        "sample_size": len(sample),
        "missing_fields": missing_fields,
        "validation_passed": len(missing_fields) == 0
    }
```

---

## Storage Estimates

**Assumptions**:
- Textbook size: ~500 pages
- Average page length: 2000 words (~10,000 characters)
- Chunk size: 512 tokens (~400 words, ~2000 characters)
- Chunks per page: 5-6 (with overlap)

**Estimates**:
- Total chunks: ~3000
- Vector storage: 3000 points × 1024 floats × 4 bytes = 12 MB
- Payload storage: 3000 points × 2 KB average payload = 6 MB
- **Total storage**: ~18 MB (well within Qdrant free tier limit of 1 GB)

---

## Migration Notes

**Phase 0 → Phase 1 Migration**:

If the data model changes between Phase 0 and Phase 1:

1. Export existing data:
   ```python
   points = client.scroll(collection_name="rag_embeddings", limit=10000)[0]
   ```

2. Transform to new schema (if needed)

3. Delete old collection, create new collection with updated schema

4. Re-import transformed data

**Recommendation**: Version the `embedding_model` field in payload to support multiple embedding versions in the future.

---

## Summary

- **3 ephemeral entities**: BookPage, TextChunk, EmbeddedChunk (in-memory only)
- **1 persistent entity**: QdrantPoint (stored in vector DB)
- **Collection**: `rag_embeddings` with 1024-dim cosine similarity vectors
- **Indexed fields**: `source_url`, `chapter`, `section` (for fast filtering)
- **Storage estimate**: ~18 MB for full textbook (~3000 chunks)
- **Validation**: Pydantic models enforce schema at ingestion time
- **Future-proof**: `embedding_model` field supports model upgrades

---

## Next Steps

1. ✅ Data model documented
2. → Proceed to `quickstart.md` (setup and execution guide)
3. → Run `/sp.tasks` to generate implementation tasks
4. → Implement `main.py` with all functions
