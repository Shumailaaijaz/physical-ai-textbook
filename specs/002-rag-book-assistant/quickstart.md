# Quickstart Guide: RAG Book Assistant Ingestion

**Date**: 2025-12-25
**Phase**: Phase 0 - Content Ingestion Pipeline
**Audience**: Developers setting up and running the textbook ingestion script

## Overview

This guide walks you through setting up the ingestion pipeline, configuring environment variables, running the script, and verifying data in Qdrant. The ingestion process fetches content from the deployed Physical AI textbook, chunks it, generates embeddings using Cohere, and stores them in Qdrant for later retrieval.

**Time to Complete**: ~30 minutes setup + ~10 minutes ingestion runtime

---

## Prerequisites

Before starting, ensure you have:

- [x] **Python 3.11+** installed ([download](https://www.python.org/downloads/))
- [x] **UV package manager** installed ([instructions](https://github.com/astral-sh/uv))
- [x] **Cohere API key** (free tier available at [cohere.com](https://dashboard.cohere.com/api-keys))
- [x] **Qdrant Cloud cluster** (free tier at [cloud.qdrant.io](https://cloud.qdrant.io))
- [x] **Git** (for cloning the repository)

### Check Python Version

```bash
python --version
# Should output: Python 3.11.x or higher
```

### Install UV

**macOS/Linux**:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows**:
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Verify installation:
```bash
uv --version
# Should output: uv 0.x.x
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/nativ-ai-web.git
cd nativ-ai-web/website
```

Navigate to the backend directory:
```bash
cd src/chatbot/backend
```

---

## Step 2: Initialize UV Project

Create a new UV project (if not already initialized):

```bash
uv init
```

This creates:
- `pyproject.toml` (project configuration)
- `uv.lock` (dependency lock file)

---

## Step 3: Install Dependencies

Add required dependencies:

```bash
uv add cohere qdrant-client beautifulsoup4 lxml httpx python-dotenv pydantic tiktoken tenacity
```

Add development dependencies:

```bash
uv add --dev pytest pytest-asyncio black ruff
```

Verify installation:
```bash
uv pip list
# Should show all installed packages
```

---

## Step 4: Configure Environment Variables

Create a `.env` file in `src/chatbot/backend/`:

```bash
# .env
COHERE_API_KEY=your-cohere-api-key-here
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key-here
TEXTBOOK_BASE_URL=https://shumailaaijaz.github.io/physical-ai-textbook/
CHUNK_SIZE=512
CHUNK_OVERLAP=128
BATCH_SIZE=96
```

### How to Get API Keys

**Cohere API Key**:
1. Sign up at [cohere.com](https://dashboard.cohere.com/register)
2. Navigate to API Keys in the dashboard
3. Create a new key or copy the default trial key
4. Paste into `.env` as `COHERE_API_KEY`

**Qdrant Credentials**:
1. Sign up at [cloud.qdrant.io](https://cloud.qdrant.io/login)
2. Create a new cluster (free tier, 1 GB storage)
3. Copy the cluster URL (e.g., `https://abc123.eu-central-1.aws.cloud.qdrant.io:6333`)
4. Generate an API key from the cluster dashboard
5. Paste into `.env` as `QDRANT_URL` and `QDRANT_API_KEY`

### Update `.env.example`

Update the example file for other developers:

```bash
# .env.example
COHERE_API_KEY=your-cohere-api-key-here
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key-here
TEXTBOOK_BASE_URL=https://shumailaaijaz.github.io/physical-ai-textbook/
CHUNK_SIZE=512
CHUNK_OVERLAP=128
BATCH_SIZE=96
```

---

## Step 5: Verify Qdrant Collection

Check if the `rag_embeddings` collection already exists:

```python
# test_qdrant_connection.py
from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv

load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

try:
    collection_info = client.get_collection("rag_embeddings")
    print(f"Collection exists: {collection_info.points_count} points")
except Exception as e:
    print(f"Collection does not exist or error: {e}")
```

Run the test:
```bash
uv run python test_qdrant_connection.py
```

**Expected Outputs**:
- If collection exists: "Collection exists: X points"
- If collection doesn't exist: Error message (script will create it)

---

## Step 6: Run the Ingestion Script

Run the `main.py` script to start ingestion:

```bash
uv run python main.py
```

### Expected Output

```text
[INFO] Fetching URLs from sitemap.xml...
[INFO] Found 87 URLs to process
[INFO] Processing URL 1/87: https://shumailaaijaz.github.io/physical-ai-textbook/
[INFO] Extracted 2453 characters from page
[INFO] Generated 3 chunks (avg 512 tokens)
[INFO] Embedded 3 chunks (batch 1)
[INFO] Saved 3 chunks to Qdrant
[INFO] Checkpoint saved (1/87 URLs processed)
...
[INFO] Processing URL 87/87: https://shumailaaijaz.github.io/physical-ai-textbook/appendix
[INFO] Ingestion complete!
[INFO] Total chunks ingested: 2847
[INFO] Total time: 8m 23s
[INFO] Average: 5.6 chunks/second
```

### Progress Tracking

The script saves checkpoints every 10 URLs to `ingestion_checkpoint.json`. If the script crashes, it will resume from the last checkpoint.

To force a fresh start:
```bash
rm ingestion_checkpoint.json
uv run python main.py
```

---

## Step 7: Verify Ingested Data

After ingestion completes, verify the data in Qdrant:

```python
# verify_ingestion.py
from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv

load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# Get collection stats
collection_info = client.get_collection("rag_embeddings")
print(f"Total points: {collection_info.points_count}")

# Sample 5 random points
sample = client.scroll(
    collection_name="rag_embeddings",
    limit=5,
    with_payload=True,
    with_vectors=False  # Don't fetch vectors (large)
)

print("\nSample chunks:")
for point in sample[0]:
    print(f"\n--- Chunk ID: {point.id} ---")
    print(f"Source: {point.payload['source_url']}")
    print(f"Chapter: {point.payload.get('chapter', 'N/A')}")
    print(f"Section: {point.payload.get('section', 'N/A')}")
    print(f"Text preview: {point.payload['text'][:200]}...")
```

Run verification:
```bash
uv run python verify_ingestion.py
```

**Expected Output**:
```text
Total points: 2847

Sample chunks:

--- Chunk ID: a3f2c8e1-4b67-4d92-8e9f-1a2b3c4d5e6f ---
Source: https://shumailaaijaz.github.io/physical-ai-textbook/chapter-4/vector-databases
Chapter: Chapter 4: Data Infrastructure for Physical AI
Section: Vector Databases
Text preview: Vector databases are specialized systems designed to store and query high-dimensional vectors efficiently. Unlike traditional relational databases that store structured data in rows and columns...
```

---

## Step 8: Test Semantic Search (Optional)

Test retrieval by running a sample query:

```python
# test_search.py
import cohere
from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv

load_dotenv()

co = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# Query
query = "What are vector databases?"

# Generate query embedding
query_embedding = co.embed(
    texts=[query],
    model="embed-multilingual-v3.0",
    input_type="search_query"  # Different from ingestion!
).embeddings.float[0]

# Search Qdrant
results = client.search(
    collection_name="rag_embeddings",
    query_vector=query_embedding,
    limit=3
)

print(f"Query: {query}\n")
for i, result in enumerate(results, 1):
    print(f"Result {i} (score: {result.score:.3f}):")
    print(f"Chapter: {result.payload.get('chapter', 'N/A')}")
    print(f"Text: {result.payload['text'][:200]}...")
    print()
```

Run search test:
```bash
uv run python test_search.py
```

**Expected Output**:
```text
Query: What are vector databases?

Result 1 (score: 0.847):
Chapter: Chapter 4: Data Infrastructure for Physical AI
Text: Vector databases are specialized systems designed to store and query high-dimensional vectors efficiently. Unlike traditional relational databases that store structured data in rows and columns...

Result 2 (score: 0.782):
Chapter: Chapter 4: Data Infrastructure for Physical AI
Text: Common use cases for vector databases include semantic search, recommendation systems, and RAG (Retrieval-Augmented Generation) applications. These databases excel at finding similar items...
```

---

## Troubleshooting

### Issue: `ImportError: No module named 'cohere'`

**Solution**: Ensure dependencies are installed in the UV environment:
```bash
uv pip list | grep cohere
# If not found:
uv add cohere
```

### Issue: `QdrantException: Unauthorized`

**Solution**: Check your Qdrant API key and URL:
```bash
# Verify .env file
cat .env | grep QDRANT
# Ensure no extra spaces or quotes around values
```

### Issue: `CohereAPIError: Rate limit exceeded`

**Solution**: The script includes exponential backoff, but if using free tier:
- Reduce `BATCH_SIZE` from 96 to 48 in `.env`
- Wait 60 seconds and retry

### Issue: Ingestion hangs or crashes mid-way

**Solution**: Resume from checkpoint:
```bash
# Check checkpoint file
cat ingestion_checkpoint.json
# Resume (script auto-detects checkpoint)
uv run python main.py
```

### Issue: Chunks have 0 tokens

**Solution**: Check text extraction from HTML:
```python
# Debug a single URL
from main import extract_text_from_url

data = extract_text_from_url("https://shumailaaijaz.github.io/physical-ai-textbook/")
print(f"Extracted {len(data['text'])} characters")
print(data['text'][:500])
```

If text is empty, the HTML structure may have changed. Update CSS selectors in `extract_text_from_url()`.

---

## Performance Tuning

### Speed Up Ingestion

1. **Increase batch size** (if not rate-limited):
   ```bash
   # .env
   BATCH_SIZE=96  # Max supported by Cohere
   ```

2. **Reduce chunk overlap** (trades quality for speed):
   ```bash
   # .env
   CHUNK_OVERLAP=64  # Down from 128
   ```

3. **Parallelize URL processing** (future enhancement):
   - Use `asyncio` to fetch multiple URLs concurrently
   - Batch embed calls across multiple pages

### Reduce Costs

1. **Use smaller chunk size** (fewer embeddings):
   ```bash
   # .env
   CHUNK_SIZE=256  # Down from 512 (2x fewer chunks)
   ```

2. **Filter URLs** (process only specific chapters):
   ```python
   # In main.py, filter URLs before processing
   urls = [u for u in all_urls if "/chapter-4/" in u]
   ```

---

## Next Steps

After successful ingestion:

1. **Phase 1: Build Query API**
   - Implement FastAPI endpoints for question answering
   - Integrate OpenRouter for LLM responses
   - Add source attribution to responses

2. **Phase 2: Frontend Integration**
   - Create chat interface
   - Add text selection mode toggle
   - Highlight source passages

3. **Monitoring & Updates**
   - Set up monitoring for Qdrant collection size
   - Schedule periodic re-ingestion (weekly/monthly)
   - Implement incremental updates based on sitemap last-modified dates

---

## Useful Commands

```bash
# Install all dependencies
uv sync

# Run ingestion
uv run python main.py

# Run tests
uv run pytest

# Format code
uv run black .

# Lint code
uv run ruff check .

# Check UV environment
uv pip list

# Clear checkpoint and restart
rm ingestion_checkpoint.json && uv run python main.py

# Export collection to backup
python -c "from qdrant_client import QdrantClient; import os; from dotenv import load_dotenv; load_dotenv(); c = QdrantClient(os.getenv('QDRANT_URL'), api_key=os.getenv('QDRANT_API_KEY')); points = c.scroll('rag_embeddings', limit=10000)[0]; import json; json.dump([{'id': p.id, 'payload': p.payload} for p in points], open('backup.json', 'w'))"
```

---

## FAQ

**Q: How long does ingestion take?**
A: Approximately 8-12 minutes for the full textbook (~500 pages, ~3000 chunks) on a standard internet connection with Cohere free tier rate limits.

**Q: Can I re-run ingestion without deleting the collection?**
A: The script deletes and recreates the collection by default. To keep existing data, comment out the `create_collection()` call in `main.py`.

**Q: What if the textbook URL changes?**
A: Update `TEXTBOOK_BASE_URL` in `.env` and re-run ingestion.

**Q: How do I update embeddings when the textbook content changes?**
A: For Phase 0, re-run the full ingestion. Phase 1 will add incremental update support using sitemap last-modified dates.

**Q: Can I use a different embedding model?**
A: Yes, but ensure you update:
- `embed()` function to use the new model
- Qdrant collection `size` parameter to match new model dimensions
- `.env` example in this guide

**Q: What if I hit Cohere rate limits?**
A: The script includes retry logic with exponential backoff. If limits persist, reduce `BATCH_SIZE` or wait for limits to reset (typically 1 minute).

---

## Support

For issues or questions:
- Check the [troubleshooting section](#troubleshooting) above
- Review `research.md` for technical decisions
- Review `data-model.md` for schema details
- Open an issue in the GitHub repository

---

**Last Updated**: 2025-12-25
**Maintained By**: RAG Book Assistant Development Team
