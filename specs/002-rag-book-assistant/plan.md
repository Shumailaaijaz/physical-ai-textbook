# Implementation Plan: RAG Book Assistant

**Branch**: `main` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-rag-book-assistant/spec.md` and user implementation requirements

## Summary

Implement a RAG (Retrieval-Augmented Generation) book assistant that ingests content from a deployed GitHub Pages textbook, creates embeddings, stores them in Qdrant vector database, and provides strict context-based question answering with hallucination prevention. The implementation focuses on Phase 0: Content Ingestion - a single `main.py` file that fetches URLs from the deployed textbook, extracts and chunks text, generates embeddings using Cohere, and stores them in Qdrant with metadata for later retrieval.

**Technical Approach**: Python-based ingestion pipeline using UV package manager, BeautifulSoup4 for HTML parsing, Cohere for embeddings, and Qdrant for vector storage. The system will crawl the deployed textbook at `https://shumailaaijaz.github.io/physical-ai-textbook/`, extract clean text with metadata (chapter, section, URL), chunk it appropriately, and upsert to the existing `rag_embeddings` collection in Qdrant.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**:
- UV (package manager and project initialization)
- Cohere Python SDK (embeddings generation)
- Qdrant Client (vector database operations)
- BeautifulSoup4 (HTML parsing and text extraction)
- requests/httpx (HTTP client for fetching URLs)

**Storage**: Qdrant Cloud Free Tier (existing collection: `rag_embeddings`)
**Testing**: pytest (unit tests for chunking, URL extraction, metadata parsing)
**Target Platform**: Backend deployment on Railway/Fly.io/Render (FastAPI will be added in Phase 1)
**Project Type**: Web application (backend-only for ingestion phase)
**Performance Goals**:
- Process entire textbook (<500 pages) in under 10 minutes
- Generate embeddings at >50 chunks/minute
- Upsert to Qdrant at >100 chunks/minute

**Constraints**:
- Single file implementation (`main.py`) for ingestion logic
- Must use existing Qdrant collection `rag_embeddings`
- Must preserve metadata (chapter, section, URL) for source attribution
- Text chunks must be <1000 tokens to fit embedding model limits
- Must handle rate limits from Cohere API gracefully

**Scale/Scope**:
- ~500 book pages to ingest
- ~2000-5000 text chunks expected
- Support for incremental re-ingestion (detect changed content)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Principles Applied**:

✅ **Principle I: Accuracy through Primary Source Verification**
- All ingested content comes directly from the deployed textbook (primary source)
- URL metadata preserved for traceability back to original content
- No content modification or inference during ingestion

✅ **Principle III: Reproducibility**
- Ingestion script runs on documented Python version (3.11+)
- All dependencies locked via UV's lockfile mechanism
- Environment variables documented in `.env.example`
- Deployment platform explicitly stated (Railway/Fly.io/Render)

✅ **Principle IV: Rigor**
- Vector embeddings use industry-standard Cohere API
- Qdrant vector database is production-grade, documented technology
- No experimental or unproven libraries in critical path

✅ **Principle V: Practicality & Inclusivity**
- Free tier infrastructure (Qdrant Cloud Free Tier, Cohere free tier available)
- Deployable on student-accessible platforms
- Clear documentation for setup and execution

**Constitution Compliance Status**: ✅ PASS - No violations detected

**Gates**:
- ✅ Single responsibility: Ingestion script has one job (fetch → chunk → embed → store)
- ✅ No premature abstraction: All logic in one file as requested, refactoring deferred to Phase 1
- ✅ Technology choices justified by project requirements (UV for modern Python packaging, Cohere for embeddings, Qdrant for vector storage)

## Project Structure

### Documentation (this feature)

```text
specs/002-rag-book-assistant/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions, chunking strategy)
├── data-model.md        # Phase 1 output (Qdrant schema, metadata structure)
├── quickstart.md        # Phase 1 output (setup and execution guide)
├── contracts/           # Phase 1 output (FastAPI endpoints for query API)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/chatbot/backend/
├── main.py              # Ingestion script (Phase 0 - THIS PLAN)
│                        # Functions: get_all_urls(), extract_text_from_url(),
│                        # chunk_text(), embed(), create_collection(),
│                        # save_chunk_to_qdrant(), main()
├── .env                 # Environment variables (existing)
├── .env.example         # Example env vars (to be updated)
├── .python-version      # Python version lock (existing: 3.11)
├── pyproject.toml       # UV project config (to be created)
└── uv.lock              # UV dependency lock (to be created)

# Phase 1 additions (future):
src/chatbot/backend/
├── api/
│   ├── main.py          # FastAPI app
│   ├── routes/          # Query endpoints
│   └── models/          # Pydantic models
├── services/
│   ├── retrieval.py     # Qdrant query logic
│   └── llm.py           # OpenRouter integration
└── tests/
    ├── test_ingestion.py
    ├── test_retrieval.py
    └── test_api.py
```

**Structure Decision**: Single-file ingestion script for Phase 0 as requested by user. This keeps the initial implementation simple and focused on the content pipeline. Phase 1 will refactor into a proper FastAPI application with separation of concerns (ingestion service, retrieval service, API layer). The monolithic approach for ingestion is justified because:
1. User explicitly requested "only one file name main.py"
2. Ingestion is a one-time/periodic batch operation, not a real-time service
3. Simplifies testing and debugging during initial development
4. Easy to refactor into modules once the pipeline is validated

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected - this section is empty.*

## Phase 0: Research & Technical Decisions

**Objective**: Resolve all technical unknowns and document decisions for ingestion pipeline implementation.

### Research Tasks

1. **Chunking Strategy for Technical Content**
   - Research: Optimal chunk size for textbook content (balancing context vs retrieval precision)
   - Research: Overlap strategy for preserving continuity across chunk boundaries
   - Decision needed: Character-based vs token-based chunking

2. **Cohere Embedding Model Selection**
   - Research: Which Cohere embedding model best suits technical textbook content
   - Options: `embed-english-v3.0`, `embed-english-light-v3.0`, `embed-multilingual-v3.0`
   - Decision criteria: Dimensionality, cost, accuracy for technical content

3. **URL Discovery Strategy**
   - Research: How to crawl GitHub Pages site structure (sitemap.xml, robots.txt, recursive links)
   - Decision needed: Sitemap-based vs recursive crawling vs hardcoded URL patterns

4. **Metadata Extraction from HTML**
   - Research: How Docusaurus structures chapter/section metadata in HTML
   - Decision needed: CSS selectors for extracting chapter titles, section headings, URLs

5. **Qdrant Collection Schema**
   - Research: Optimal vector dimensionality and distance metric for semantic search
   - Decision needed: Payload schema for metadata (chapter, section, url, chunk_index)

6. **Rate Limiting & Error Handling**
   - Research: Cohere API rate limits (free vs paid tier)
   - Research: Qdrant upsert batch size recommendations
   - Decision needed: Retry strategy, exponential backoff, progress persistence

7. **Incremental Updates**
   - Research: How to detect changed content in GitHub Pages deployment
   - Decision needed: Full re-ingestion vs diff-based updates (Phase 0 vs Phase 1 feature)

### Output

`research.md` will document:
- Chosen chunking strategy with code examples
- Selected Cohere model with justification
- URL discovery approach with implementation notes
- HTML parsing selectors for metadata extraction
- Qdrant schema definition
- Error handling and rate limiting approach
- Future roadmap for incremental updates

## Phase 1: Design & Contracts

### Data Model (`data-model.md`)

**Entities to Model**:

1. **BookContent** (pre-ingestion):
   - url: str (canonical URL from GitHub Pages)
   - raw_html: str (fetched HTML)
   - extracted_text: str (clean text post-parsing)
   - chapter_title: str | None (from HTML metadata)
   - section_title: str | None (from HTML metadata)

2. **TextChunk** (post-chunking):
   - chunk_id: str (generated UUID or hash)
   - content: str (chunk text, <1000 tokens)
   - metadata: ChunkMetadata
   - embedding: list[float] | None (Cohere embedding vector)

3. **ChunkMetadata**:
   - source_url: str (original page URL)
   - chapter: str | None
   - section: str | None
   - chunk_index: int (position in document)
   - char_start: int (character offset in original text)
   - char_end: int (character offset in original text)

4. **QdrantDocument** (stored in vector DB):
   - id: str (chunk_id)
   - vector: list[float] (embedding)
   - payload: dict (ChunkMetadata as JSON)

### API Contracts (`contracts/`)

**Phase 0 (Ingestion)**: No API contracts - command-line script

**Phase 1 (Query API)**: FastAPI endpoints to be designed in next planning iteration

### Quickstart Documentation (`quickstart.md`)

Will include:
- Prerequisites (Python 3.11+, UV installed)
- Environment setup (Cohere API key, Qdrant credentials)
- Running ingestion: `uv run python main.py`
- Verifying data in Qdrant
- Troubleshooting common errors

### Agent Context Update

Technologies to add to agent context:
- UV (Python package manager)
- Cohere (embedding API)
- Qdrant (vector database)
- BeautifulSoup4 (HTML parsing)
- Docusaurus (for understanding HTML structure)

## Implementation Phases Summary

**Phase 0 (This Plan)**: Content Ingestion Pipeline
- ✅ Scope: Single `main.py` file with all ingestion functions
- ✅ Input: Deployed textbook URL (`https://shumailaaijaz.github.io/physical-ai-textbook/`)
- ✅ Output: Populated Qdrant collection `rag_embeddings`
- ✅ Deliverables: Working ingestion script, research.md, data-model.md, quickstart.md

**Phase 1 (Future)**: Query API & LLM Integration
- Scope: FastAPI endpoints, OpenRouter integration, retrieval service
- Input: User questions + optional selected text
- Output: Context-aware answers with source attribution
- Deliverables: API contracts, Pydantic models, test suite

**Phase 2 (Future)**: Frontend Integration
- Scope: Chat interface, text selection mode toggle, source highlighting
- Deliverables: React components, deployment to Vercel/GitHub Pages

## Next Steps

1. ✅ Complete `research.md` (resolve all technical decisions)
2. ✅ Complete `data-model.md` (finalize Qdrant schema)
3. ✅ Complete `quickstart.md` (setup and execution guide)
4. → Run `/sp.tasks` to generate implementation tasks for Phase 0
5. → Run `/sp.implement` to execute tasks (or implement manually)

## Architectural Decision Records (ADRs)

**Potential ADRs for this feature** (to be created if significant decisions warrant documentation):

1. **ADR: Single-file vs modular ingestion architecture**
   - Decision: Start with single `main.py`, refactor in Phase 1
   - Rationale: User requirement + simplicity for batch operations
   - Trade-off: Technical debt vs rapid initial delivery

2. **ADR: Cohere vs OpenAI vs sentence-transformers for embeddings**
   - Decision: TBD in research.md
   - Rationale: Cost, accuracy, deployment simplicity
   - Trade-off: Vendor lock-in vs managed service convenience

3. **ADR: Full re-ingestion vs incremental updates**
   - Decision: Start with full re-ingestion, add incremental in Phase 1
   - Rationale: Simpler initial implementation, textbook updates infrequent
   - Trade-off: Slower updates vs implementation complexity

**Recommendation**: Create ADR #1 after Phase 0 completion to document the architectural decision for posterity.

## Risk Analysis

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Cohere API rate limits block ingestion | High - Cannot complete data pipeline | Medium | Implement exponential backoff, batch processing, consider free tier limits in design |
| GitHub Pages site structure changes | Medium - Breaks URL discovery/parsing | Low | Use robust CSS selectors, fallback to manual URL list, document parsing assumptions |
| Qdrant collection schema mismatch | High - Data incompatible with existing collection | Medium | Verify collection schema before ingestion, add schema validation, document expected structure |
| Text chunking loses critical context | Medium - Degrades answer quality | High | Research optimal chunk size/overlap, test with sample queries, iterate based on retrieval results |
| HTML parsing fails on complex pages | Medium - Missing content | Medium | Test on diverse page types, log parsing failures, manual review of extracted content |
| UV package manager adoption issues | Low - Fallback to pip/venv | Low | Document fallback instructions, UV is stable and well-documented |

## Dependencies

**External Services**:
- Cohere API (embeddings generation) - requires API key
- Qdrant Cloud (vector storage) - requires cluster URL and API key
- GitHub Pages (content source) - public, no auth required

**Python Libraries** (to be locked in `uv.lock`):
- `cohere` - Official Cohere Python SDK
- `qdrant-client` - Official Qdrant Python client
- `beautifulsoup4` - HTML parsing
- `lxml` - BeautifulSoup parser backend (faster than html.parser)
- `httpx` - Modern async HTTP client (for fetching URLs)
- `python-dotenv` - Environment variable management
- `pydantic` - Data validation (for metadata structures)

**Development Dependencies**:
- `pytest` - Testing framework
- `pytest-asyncio` - Async test support
- `black` - Code formatting
- `ruff` - Linting

## Open Questions

1. **Existing Qdrant collection schema**: What is the current vector dimensionality and payload structure of `rag_embeddings`? (Need to inspect before designing ingestion)
2. **Cohere tier**: Is there a paid Cohere account available, or should we design for free tier rate limits?
3. **Textbook update frequency**: How often does the GitHub Pages content change? (Informs incremental update priority)
4. **Deployment timing**: Should ingestion run as a one-time setup script, scheduled cron job, or manual trigger? (Phase 0 vs Phase 1 decision)

**Action Items**:
- [ ] User to provide Qdrant collection schema details or access to inspect `rag_embeddings`
- [ ] User to clarify Cohere API tier (free/paid)
- [ ] Decide on ingestion trigger mechanism (manual CLI for Phase 0 recommended)
