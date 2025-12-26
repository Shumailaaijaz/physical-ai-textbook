---
id: 002
title: RAG Ingestion Pipeline Implementation Plan
stage: plan
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: rag-book-assistant
branch: main
user: developer
command: /sp.plan
labels: ["planning", "architecture", "ingestion", "rag", "cohere", "qdrant"]
links:
  spec: specs/002-rag-book-assistant/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-rag-book-assistant/plan.md
  - specs/002-rag-book-assistant/research.md
  - specs/002-rag-book-assistant/data-model.md
  - specs/002-rag-book-assistant/quickstart.md
tests:
  - Constitution compliance check (all principles passed)
---

## Prompt

/sp.plan use backend folder D:\nativ-ai-web\website\src\chatbot\backend and initialize project with **UV Package **
-Setup **Cohere** and **Qdrant** clients
-Fetch, clean, and chunk text from deployed URLs
-Denerate embeddings and upsert into Qdrant with metadata
-only in the one file name main.py system design ( get_all_urls, extract_text_from_url chunk_text, embed,
create_collection, save_chunk_to_qdrant and execute in last main funtion ) here is
deploy link:https://shumailaaijaz.github.io/physical-ai-textbook/ github-pages
in the backend folder create only one main.py file for all the functional file like ingestion.
first get urls and then chunks embed and then store them in quadrant i have a collection of qudrant name rag_embeddings use it.

## Response snapshot

Created comprehensive implementation plan for RAG Book Assistant content ingestion pipeline (Phase 0).

**Planning Artifacts Created**:

1. **plan.md** - Complete implementation plan including:
   - Technical context (Python 3.11+, UV, Cohere, Qdrant, BeautifulSoup4)
   - Constitution compliance check (all principles passed)
   - Project structure (single main.py for Phase 0, modular refactor for Phase 1)
   - Complexity tracking (no violations)
   - Risk analysis (6 risks identified with mitigations)
   - Deployment stack integration (FastAPI, Railway/Fly.io/Render, Neon Postgres, Vercel)

2. **research.md** - Technical decisions for 7 critical areas:
   - Chunking: 512 tokens with 128-token overlap (token-based using tiktoken)
   - Embedding model: Cohere embed-multilingual-v3.0 (1024-dim, supports future Urdu content)
   - URL discovery: Sitemap.xml parsing with recursive crawl fallback
   - Metadata extraction: CSS selector-based using BeautifulSoup (Docusaurus structure)
   - Qdrant schema: 1024-dim vectors, cosine similarity, indexed on source_url/chapter/section
   - Rate limiting: 96 chunks/batch, exponential backoff, checkpoint-based resume
   - Incremental updates: Deferred to Phase 1 (full re-ingestion for Phase 0)

3. **data-model.md** - Entity schemas and relationships:
   - 3 ephemeral entities: BookPage, TextChunk, EmbeddedChunk (in-memory processing)
   - 1 persistent entity: QdrantPoint (vector DB storage)
   - Payload schema: 10 fields including text, metadata, timestamps
   - Storage estimate: ~18 MB for 3000 chunks (well within Qdrant free tier)
   - Query patterns preview for Phase 1 (semantic search, filtered by chapter)

4. **quickstart.md** - Complete setup and execution guide:
   - Prerequisites (Python 3.11+, UV, Cohere API key, Qdrant cluster)
   - Step-by-step installation and configuration
   - Environment variable setup (.env file structure)
   - Ingestion execution and verification
   - Troubleshooting guide (6 common issues with solutions)
   - Performance tuning and cost reduction tips

**Key Architectural Decisions**:

1. **Single-file implementation for Phase 0**: User requirement + simplicity for batch operations
   - Justification: Ingestion is periodic, not real-time; easier to debug and validate
   - Refactor plan: Modular structure in Phase 1 (api/, services/, tests/)

2. **Cohere embed-multilingual-v3.0**: Future-proofs for Urdu translation (constitution requirement)
   - No cost penalty vs English-only model
   - 1024 dimensions for high accuracy on technical content

3. **Token-based chunking with overlap**: Balances context vs precision
   - 512 tokens (Cohere model limit) with 128-token overlap (25%)
   - Research-backed: 20-30% overlap reduces context loss significantly

4. **Sitemap.xml + fallback crawling**: Robust URL discovery
   - Primary: Docusaurus auto-generates sitemap.xml (reliable, includes last-modified)
   - Fallback: Recursive crawling if sitemap unavailable

5. **Checkpointing for resume capability**: Handles network failures gracefully
   - Saves progress every 10 URLs to ingestion_checkpoint.json
   - Auto-resumes on restart without re-processing completed URLs

**Constitution Compliance**:
- ✅ Principle I (Accuracy): All content from primary source (deployed textbook)
- ✅ Principle III (Reproducibility): Locked dependencies (UV), documented environment
- ✅ Principle IV (Rigor): Industry-standard tools (Cohere, Qdrant, BeautifulSoup)
- ✅ Principle V (Practicality): Free tier infrastructure, accessible deployment

**Technology Stack**:
- Package Manager: UV (modern Python tooling)
- HTTP Client: httpx (async support)
- HTML Parser: BeautifulSoup4 + lxml
- Tokenizer: tiktoken (OpenAI, Cohere-compatible)
- Embedding API: Cohere (multilingual-v3.0)
- Vector DB: Qdrant Cloud (free tier)
- Data Validation: Pydantic v2
- Retry Logic: tenacity
- Testing: pytest

**Performance Estimates**:
- Ingestion time: 8-12 minutes for ~500 pages
- Total chunks: ~3000
- Storage: ~18 MB (vectors + payload)
- Throughput: 5-6 chunks/second (with Cohere rate limits)

**Next Steps Documented**:
1. Run `/sp.tasks` to generate implementation tasks
2. Implement main.py with all 6 functions (get_all_urls, extract_text_from_url, chunk_text, embed, create_collection, save_chunk_to_qdrant)
3. Test on sample URLs before full ingestion
4. Verify data in Qdrant using provided scripts

## Outcome

- ✅ Impact: Complete Phase 0 planning with all technical unknowns resolved, ready for implementation
- 🧪 Tests: Constitution check passed (5/5 principles), no complexity violations
- 📁 Files: plan.md (5.8KB), research.md (14.2KB), data-model.md (10.1KB), quickstart.md (8.9KB)
- 🔁 Next prompts: Run `/sp.tasks` to generate actionable implementation tasks for main.py development
- 🧠 Reflection: Successfully balanced user requirement for single-file simplicity with architectural best practices by planning Phase 1 refactor upfront. Research phase resolved all "NEEDS CLARIFICATION" items through reasoned defaults and industry best practices. Multilingual embedding choice future-proofs for constitution's Urdu requirement.

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell scripts unavailable in Git Bash environment; handled by manually creating plan artifacts following template structure
- Graders run and results (PASS/FAIL): Manual constitution compliance review - PASS (5/5 principles adhered to)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): In Phase 1, test incremental updates using sitemap last-modified dates to avoid full re-ingestion overhead; measure time savings and data consistency
