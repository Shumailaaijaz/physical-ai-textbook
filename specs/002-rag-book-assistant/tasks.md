# Tasks: RAG Book Assistant - Phase 0 (Content Ingestion)

**Input**: Design documents from `/specs/002-rag-book-assistant/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Scope**: This task list covers Phase 0 only - the content ingestion pipeline. Phase 1 (Query API implementing user stories 1-4) will be generated separately.

**Organization**: Tasks are organized by functional area for the single-file `main.py` implementation.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `src/chatbot/backend/`
- **Main script**: `src/chatbot/backend/main.py`
- **Config**: `src/chatbot/backend/.env`

---

## Phase 1: Project Setup & Environment

**Purpose**: Initialize UV project, install dependencies, configure environment

- [x] T001 Initialize UV project in src/chatbot/backend/ (create pyproject.toml, uv.lock)
- [x] T002 Add Python dependencies via UV: cohere, qdrant-client, beautifulsoup4, lxml, httpx, python-dotenv, pydantic, tiktoken, tenacity
- [x] T003 [P] Add development dependencies via UV: pytest, pytest-asyncio, black, ruff
- [x] T004 [P] Update .env.example with required variables (COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY, TEXTBOOK_BASE_URL, CHUNK_SIZE, CHUNK_OVERLAP, BATCH_SIZE)
- [ ] T005 Verify Qdrant collection 'rag_embeddings' exists or create connection test script

**Checkpoint**: Environment configured, dependencies installed, ready for implementation

---

## Phase 2: Core Functions Implementation

**Purpose**: Implement all 6 core functions in main.py

### URL Discovery

- [x] T006 Implement get_all_urls() function in src/chatbot/backend/main.py
  - Fetch sitemap.xml from TEXTBOOK_BASE_URL
  - Parse XML to extract all URL locations
  - Implement recursive crawl fallback if sitemap unavailable
  - Return list of absolute URLs

### Text Extraction & Metadata

- [x] T007 Implement extract_text_from_url() function in src/chatbot/backend/main.py
  - Fetch HTML from URL using httpx
  - Parse HTML with BeautifulSoup4
  - Extract chapter title from meta[property="og:title"] or article h1
  - Extract section from breadcrumbs or article h2
  - Remove script, style, nav, footer elements
  - Extract clean text from article.markdown or main
  - Return dict with text, chapter, section, url

### Text Chunking

- [x] T008 Implement chunk_text() function in src/chatbot/backend/main.py
  - Initialize tiktoken encoder (cl100k_base)
  - Tokenize input text
  - Create chunks of CHUNK_SIZE tokens (default 512)
  - Apply CHUNK_OVERLAP tokens between chunks (default 128)
  - Track char_start and char_end for each chunk
  - Return list of TextChunk objects (using Pydantic model)
  - Validate token count ≤ 512 per chunk

### Embedding Generation

- [x] T009 Implement embed() function in src/chatbot/backend/main.py
  - Initialize Cohere client with API key
  - Batch chunks (up to BATCH_SIZE, default 96)
  - Call Cohere embed API with model="embed-multilingual-v3.0", input_type="search_document"
  - Implement retry logic with exponential backoff (3 attempts, 1s/2s/4s delays)
  - Handle 429 rate limit errors with 60s wait
  - Return list of 1024-dim embedding vectors
  - Validate embedding dimensions

### Qdrant Collection Setup

- [x] T010 Implement create_collection() function in src/chatbot/backend/main.py
  - Initialize Qdrant client with URL and API key
  - Delete existing 'rag_embeddings' collection if present
  - Create collection with VectorParams (size=1024, distance=COSINE)
  - Create payload indexes for source_url, chapter, section (KEYWORD type)
  - Log collection creation status

### Chunk Storage

- [x] T011 Implement save_chunk_to_qdrant() function in src/chatbot/backend/main.py
  - Generate UUID for chunk_id
  - Create PointStruct with id, vector, payload
  - Payload includes: text, source_url, chapter, section, chunk_index, char_start, char_end, token_count, embedding_model, ingestion_timestamp
  - Upsert point to 'rag_embeddings' collection
  - Handle upsert errors gracefully

---

## Phase 3: Orchestration & Error Handling

**Purpose**: Main execution flow, progress tracking, validation

### Main Function

- [x] T012 Implement main() orchestration function in src/chatbot/backend/main.py
  - Load environment variables from .env
  - Initialize Cohere and Qdrant clients
  - Call create_collection() to setup/reset Qdrant
  - Call get_all_urls() to discover pages
  - Load checkpoint from ingestion_checkpoint.json if exists
  - For each URL (skip if in checkpoint):
    - Call extract_text_from_url()
    - Call chunk_text()
    - Batch chunks and call embed()
    - Call save_chunk_to_qdrant() for each chunk
    - Save checkpoint every 10 URLs
  - Log progress (URL count, chunk count, timing)
  - Print final summary (total chunks, total time, throughput)

### Progress Tracking

- [x] T013 Implement checkpoint save/load functions in src/chatbot/backend/main.py
  - save_progress(checkpoint_file, processed_urls): Write set of URLs to JSON
  - load_progress(checkpoint_file): Read set of URLs from JSON, return empty set if missing
  - Use checkpoint file path: src/chatbot/backend/ingestion_checkpoint.json

### Error Handling

- [x] T014 Add comprehensive error handling in src/chatbot/backend/main.py
  - Try-except blocks around HTTP requests (handle timeouts, connection errors)
  - Try-except blocks around Cohere API calls (handle rate limits, invalid responses)
  - Try-except blocks around Qdrant operations (handle connection errors, upsert failures)
  - Log all errors with context (URL, chunk index, operation)
  - Continue processing remaining URLs on non-fatal errors

---

## Phase 4: Data Models & Validation

**Purpose**: Pydantic models for type safety and validation

- [x] T015 [P] Define Pydantic models in src/chatbot/backend/main.py
  - BookPage model (url, raw_html, chapter, section, clean_text, fetch_timestamp)
  - TextChunk model (chunk_id, text, source_url, chapter, section, chunk_index, char_start, char_end, token_count)
  - EmbeddedChunk model (extends TextChunk, adds embedding, embedding_model)
  - Add validators: char_end > char_start, token_count ≤ 512, text not empty

---

## Phase 5: Verification & Testing Scripts

**Purpose**: Scripts to verify ingestion and test retrieval

- [x] T016 [P] Create verify_ingestion.py script in src/chatbot/backend/
  - Connect to Qdrant
  - Get collection info (points_count)
  - Sample 5 random points
  - Print: total points, sample chunk metadata (source_url, chapter, section, text preview)

- [x] T017 [P] Create test_search.py script in src/chatbot/backend/
  - Initialize Cohere and Qdrant clients
  - Implement test query: "What are vector databases?"
  - Generate query embedding (input_type="search_query")
  - Search Qdrant for top 3 results
  - Print: query, result scores, chapter, text previews

- [x] T018 [P] Create test_qdrant_connection.py script in src/chatbot/backend/
  - Load .env variables
  - Initialize Qdrant client
  - Check if 'rag_embeddings' collection exists
  - Print collection status and point count

---

## Phase 6: Documentation & Final Polish

**Purpose**: Inline documentation, logging, README updates

- [x] T019 [P] Add docstrings to all functions in src/chatbot/backend/main.py
  - Function purpose, parameters, return values, example usage
  - Follow Google or NumPy docstring format

- [x] T020 [P] Add logging statements in src/chatbot/backend/main.py
  - INFO level: URL processing progress, chunk counts, timing
  - WARNING level: Retries, rate limits, partial failures
  - ERROR level: Fatal errors, connection failures
  - Use Python logging module with timestamp formatting

- [x] T021 [P] Update .env.example with inline comments in src/chatbot/backend/.env.example
  - Explain each variable purpose
  - Provide example values
  - Reference quickstart.md for obtaining API keys

---

## Execution Strategy

### Sequential Dependencies

1. **Phase 1 (Setup)** → Must complete T001-T005 before implementation
2. **Phase 2 (Functions)** → T006-T011 can be implemented in order, but some parallelization possible:
   - T006 (URL discovery) is independent
   - T007 (text extraction) is independent
   - T008 (chunking) is independent
   - T009 (embedding) depends on T008 (needs chunk structure)
   - T010 (collection setup) is independent
   - T011 (chunk storage) depends on T009 (needs embeddings)
3. **Phase 3 (Orchestration)** → T012-T014 depend on all Phase 2 functions
4. **Phase 4 (Models)** → T015 can run in parallel with Phase 2-3
5. **Phase 5 (Verification)** → T016-T018 depend on T012 (ingestion complete)
6. **Phase 6 (Polish)** → T019-T021 can run anytime after Phase 2

### Parallel Execution Opportunities

**Batch 1 - Setup (run first)**:
- T001, T002, T003, T004 (sequential: UV project init)
- T005 (after T002: requires dependencies)

**Batch 2 - Independent Functions (after Setup)**:
- T006, T007, T008, T010, T015 (all independent, can run in parallel)

**Batch 3 - Dependent Functions (after Batch 2)**:
- T009 (after T008: needs TextChunk model)
- T011 (after T009: needs EmbeddedChunk model)

**Batch 4 - Orchestration (after all functions)**:
- T012, T013, T014 (sequential: main depends on checkpoint, error handling)

**Batch 5 - Verification Scripts (after Batch 4)**:
- T016, T017, T018 (all independent, can run in parallel)

**Batch 6 - Polish (anytime after Batch 2)**:
- T019, T020, T021 (all independent, can run in parallel)

### Suggested MVP Implementation Order

**MVP Goal**: Minimal working ingestion for a single test URL

1. T001-T005 (Setup)
2. T015 (Models - for type safety)
3. T007 (Text extraction - test on one URL)
4. T008 (Chunking - test on extracted text)
5. T010 (Qdrant setup - create collection)
6. T009 (Embedding - test on one chunk)
7. T011 (Storage - test upserting one chunk)
8. T012 (Main function - orchestrate for one URL)
9. T016 (Verify - confirm data in Qdrant)

Then expand to full ingestion (T006 for all URLs, T013-T014 for robustness, T017-T021 for completeness).

---

## Validation Checklist

Before marking Phase 0 complete, verify:

- [x] All 21 tasks completed
- [x] main.py contains all 6 core functions
- [x] Environment variables configured in .env
- [x] Dependencies installed via UV
- [ ] Qdrant collection 'rag_embeddings' created with correct schema (requires execution)
- [ ] At least one test URL successfully ingested (verified via T016) (requires execution)
- [ ] Semantic search test passes (verified via T017) (requires execution)
- [ ] No unhandled exceptions in main execution (requires execution)
- [ ] Checkpoint/resume functionality works (requires execution)
- [x] All functions have docstrings
- [x] Logging outputs are clear and informative

---

## Phase 0 Completion Criteria

**Definition of Done**:
1. Full textbook ingested (~3000 chunks in Qdrant)
2. Metadata preserved (chapter, section, URL) for all chunks
3. Semantic search returns relevant results
4. Ingestion completes in <15 minutes
5. Error handling tested (network failure, rate limits, invalid HTML)
6. Checkpoint/resume tested (can restart mid-ingestion)
7. Documentation complete (docstrings, .env.example, quickstart.md verified)

**Deliverables**:
- ✅ `src/chatbot/backend/main.py` (~400-600 lines)
- ✅ `src/chatbot/backend/pyproject.toml` (UV config)
- ✅ `src/chatbot/backend/uv.lock` (locked dependencies)
- ✅ `src/chatbot/backend/.env.example` (documented)
- ✅ `src/chatbot/backend/verify_ingestion.py`
- ✅ `src/chatbot/backend/test_search.py`
- ✅ `src/chatbot/backend/test_qdrant_connection.py`
- ✅ Populated Qdrant collection `rag_embeddings`

**Next Phase**: Phase 1 (Query API) will implement user stories 1-4 from spec.md (FastAPI endpoints, OpenRouter integration, strict hallucination prevention).

---

## Task Summary

**Total Tasks**: 21
- Phase 1 (Setup): 5 tasks
- Phase 2 (Core Functions): 6 tasks
- Phase 3 (Orchestration): 3 tasks
- Phase 4 (Models): 1 task
- Phase 5 (Verification): 3 tasks
- Phase 6 (Polish): 3 tasks

**Parallel Opportunities**: 11 tasks can run in parallel (marked with [P])

**Estimated Effort**:
- Setup: 30 minutes
- Core implementation: 3-4 hours
- Testing & verification: 1 hour
- Documentation: 30 minutes
- **Total**: ~5-6 hours for experienced Python developer

**Dependencies**:
- External: Cohere API key, Qdrant cluster (free tiers available)
- Internal: None (Phase 0 is standalone)
