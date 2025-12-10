# Implementation Plan: ChatKit Gemini RAG Chatbot for Textbook

**Branch**: `main` (chatbot subproject) | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `src/chatbot/specs/chatkit/spec.md`

## Summary

Build a RAG (Retrieval-Augmented Generation) chatbot that integrates OpenAI's ChatKit framework with Google Gemini to provide textbook-grounded Q&A. Students can ask questions about the Physical AI & Humanoid Robotics textbook and receive citation-backed answers. The system features:

- **Dual-mode interaction**: General textbook search (RAG with Qdrant) + selected-text-only queries
- **Citation system**: Clickable citations that navigate to exact textbook sections with highlight animation
- **Vector search**: Qdrant stores 400-token chunks with embeddings for semantic retrieval
- **Streaming responses**: Real-time SSE streaming via ChatKit protocol
- **Embedded UI**: Floating action button + modal popup integrated into Docusaurus textbook

**Architecture**: React + ChatKit (frontend) → FastAPI + LangChain + Qdrant (backend) → Gemini (LLM)

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend), Node.js 18+ (tooling)

**Primary Dependencies**:
- **Backend**:
  - `fastapi>=0.115.6` - Web framework with async support
  - `uvicorn[standard]>=0.32.1` - ASGI server with WebSocket/SSE
  - `openai-agents[litellm]>=0.6.2` - Agent orchestration + Gemini integration
  - `openai-chatkit<=1.4.0` - ChatKit protocol server
  - `langchain>=0.1.0` - RAG pipeline orchestration
  - `langchain-openai>=0.0.2` - OpenAI embeddings integration
  - `langchain-community>=0.0.10` - Qdrant connector
  - `qdrant-client>=1.7.0` - Vector database client
  - `python-dotenv>=1.0.1` - Environment variables

- **Frontend**:
  - `react@18.3.1` - UI framework
  - `@openai/chatkit-react@^1.3.0` - ChatKit UI components
  - `typescript@5.6.3` - Type safety
  - `vite@6.0.3` - Build tool

**Storage**:
- **Vector Store**: Qdrant Cloud (free tier: 1GB, 100k vectors, 10 QPS)
- **Metadata** (optional Phase 2): Neon Postgres (free tier: 3GB)
- **In-Memory Cache**: Python dict for thread/message data
- **Client**: localStorage for thread ID persistence

**Testing**: Manual via `/health`, `/debug/threads` endpoints; citation validation (Phase 2)

**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

**Project Type**: Web application (separate backend + frontend)

**Performance Goals**:
- First token: <2 seconds (embedding 200ms + Qdrant 300ms + Gemini 1000ms)
- Citation navigation: <500ms
- Modal open: <300ms

**Constraints**:
- Requires API keys: GEMINI_API_KEY, OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY
- Qdrant free tier: 1GB storage (~200k chunks), 10 queries/second
- Selected-text mode: 10-2000 words limit
- In-memory store: data lost on restart (acceptable for MVP)

**Scale/Scope**: Hackathon/demo (100-200 concurrent users); production-ready with Postgres migration

## Environment Variables Required

Create `.env` file in `backend/` directory:

```bash
# AI Models
GEMINI_API_KEY=your_google_ai_studio_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Vector Database
QDRANT_URL=https://xxxxx-xxxxx.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# Optional (Phase 2 - Production)
NEON_DB_URL=postgresql://user:pass@ep-xxxxx.us-east-2.aws.neon.tech/dbname

# Server Config
PORT=8000
LOG_LEVEL=INFO
ENVIRONMENT=development
```

**How to get API keys**:
1. **Gemini API Key**: Visit https://makersuite.google.com/app/apikey → Create API Key
2. **OpenAI API Key**: Visit https://platform.openai.com/api-keys → Create new secret key (for embeddings)
3. **Qdrant Cloud**: Visit https://cloud.qdrant.io → Sign up (free) → Create cluster → Copy URL + API key
4. **Neon Postgres** (optional): Visit https://neon.tech → Sign up (free) → Create project → Copy connection string

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Validating against `src/chatbot/.specify/memory/constitution.md`:

- ✅ **Source Fidelity**: RAG pipeline constrains answers to Qdrant-retrieved chunks (FR-014 to FR-018)
- ✅ **RAG Pipeline Transparency**: Citations display chapter, section, similarity scores (FR-025 to FR-028)
- ✅ **Dual-Mode Interaction**: General mode (full RAG) + selected-text mode (no retrieval) (FR-014 to FR-024)
- ✅ **Zero Hallucination**: Similarity threshold 0.7, explicit refusal when insufficient context (FR-015, Edge Cases)
- ✅ **Explainability & Citations**: Inline citations as `[Chapter X, Section Y.Z]` with clickable navigation (FR-025 to FR-026)

**No violations**. System design aligns with all 5 core principles.

## Project Structure

### Documentation

```text
src/chatbot/specs/chatkit/
├── spec.md              # Feature specification ✅
├── plan.md              # This file ✅
├── research.md          # Technology research (generated below)
├── data-model.md        # Entity definitions (generated below)
├── quickstart.md        # Setup guide (generated below)
├── contracts/           # API specifications (generated below)
│   ├── chatkit-api.yaml     # OpenAPI spec
│   └── qdrant-schema.json   # Vector DB schema
├── checklists/
│   └── requirements.md  # Spec validation ✅
└── tasks.md             # Implementation tasks (/sp.tasks)
```

### Source Code

```text
src/chatbot/
├── backend/
│   ├── main.py              # FastAPI app + RAG pipeline
│   ├── ingest.py            # Textbook → Qdrant ingestion
│   ├── requirements.txt     # Python dependencies
│   ├── .python-version      # Python 3.11
│   ├── .env                 # API keys (gitignored)
│   └── env/                 # Virtual environment (gitignored)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                      # Docusaurus integration
│   │   ├── main.tsx                     # React entry
│   │   ├── components/
│   │   │   ├── ChatbotWidget.tsx        # FAB + modal wrapper
│   │   │   ├── Citation.tsx             # Citation link component
│   │   │   └── TextSelectionHandler.tsx # Selected-text logic
│   │   └── hooks/
│   │       └── useTextSelection.ts      # Text selection detection
│   ├── package.json         # npm dependencies
│   ├── tsconfig.json        # TypeScript config
│   └── vite.config.ts       # Build config
│
├── .env.example             # Environment template
└── README.md                # Project overview ✅
```

### Docusaurus Integration

```text
D:\nativ-ai-web\website/     # Main textbook repo
├── src/
│   ├── theme/
│   │   └── Root.tsx         # Swizzle to inject ChatbotWidget globally
│   ├── components/
│   │   └── Chatbot.js       # OLD (DELETE - replaced by chatbot/frontend/)
│   └── chatbot/             # NEW subproject (this folder)
│
└── docs/                    # Textbook .md files (ingestion source)
```

**Structure Decision**: Chatbot as self-contained subproject in `src/chatbot/` with separate backend/frontend. Backend runs independently (port 8000), frontend components imported into Docusaurus build.

## Key Architectural Decisions

### ADR-002: LangChain for RAG Pipeline (UPDATED)

**Context**: Need framework to orchestrate document loading, chunking, embedding, retrieval, and LLM generation.

**Decision**: Use LangChain's `RetrievalQA` chain with Qdrant vector store and OpenAI embeddings.

**Rationale**:
- `DirectoryLoader` + `RecursiveCharacterTextSplitter` for Docusaurus .md parsing and chunking
- `QdrantVectorStore` connector with metadata filtering (chapter, section)
- `RetrievalQA` combines retriever + LLM + prompt in single chain
- `return_source_documents=True` provides chunk metadata for citations
- Works with Gemini via `ChatLiteLLM` wrapper

**Implementation**:
```python
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant
from langchain_community.chat_models import ChatLiteLLM

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vector_store = Qdrant(
    client=qdrant_client,
    collection_name="textbook_chunks",
    embeddings=embeddings,
)
llm = ChatLiteLLM(model="gemini/gemini-2.0-flash", temperature=0.2, max_tokens=500)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 5, "score_threshold": 0.7}),
    return_source_documents=True,
)

result = qa_chain({"query": "What is forward kinematics?"})
answer = result["result"]
sources = result["source_documents"]  # For citations
```

**Tradeoffs**:
- ✅ Pro: Reduces custom code by 70% (vs raw Qdrant + Gemini)
- ✅ Pro: Built-in source document tracking
- ✅ Pro: Easy to swap vector stores
- ⚠️ Con: Heavyweight dependency (LangChain + 3 integration packages)

---

### ADR-007: Qdrant for Vector Store

**Context**: Need scalable vector database for textbook embeddings with metadata filtering.

**Decision**: Use Qdrant Cloud (managed) for vector storage and similarity search.

**Rationale**:
- **Performance**: HNSW indexing, 10ms p95 latency for 100k vectors
- **Metadata Filtering**: Native support for chapter/section filters
- **Free Tier**: 1GB storage (~200k vectors), 10 QPS
- **Managed Service**: No self-hosting vs Weaviate, Milvus

**Qdrant Schema**:
```python
from qdrant_client import QdrantClient, models

client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))

client.create_collection(
    collection_name="textbook_chunks",
    vectors_config=models.VectorParams(
        size=1536,  # text-embedding-3-small dimension
        distance=models.Distance.COSINE,
    ),
)

# Metadata payload per chunk
payload = {
    "text": "Forward kinematics calculates...",
    "chapter": 3,
    "section": "2.1",
    "heading": "forward-kinematics",
    "source_file": "docs/chapter-3/kinematics.md",
}
```

**Alternatives Rejected**:
- Pinecone: No metadata filtering in free tier
- Weaviate: Requires Docker, no free managed tier
- Chroma: No production-ready managed service
- FAISS: No metadata filtering, not scalable

---

### ADR-008: Chunking Strategy

**Context**: Docusaurus .md files need splitting for embedding.

**Decision**: `RecursiveCharacterTextSplitter` with 400-token chunks, 100-token overlap.

**Rationale**:
- **400 tokens** (~300 words): Balances context vs embedding limits
- **100-token overlap** (25%): Prevents split sentences, maintains continuity
- **Recursive splitting**: Respects Markdown structure (splits on `\n\n`, then `\n`, then space)

**Implementation**:
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tiktoken

encoding = tiktoken.get_encoding("cl100k_base")  # For text-embedding-3-small

splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,
    chunk_overlap=100,
    length_function=lambda text: len(encoding.encode(text)),
    separators=["\n\n", "\n", " ", ""],
)

chunks = splitter.split_documents(documents)
```

**Chunk Size Analysis**:
- 200 tokens: Too granular, high storage
- **400 tokens**: Good balance ✅
- 600 tokens: Exceeds typical paragraph length
- 1000 tokens: Too coarse, poor precision

---

### ADR-001: ChatKit Framework (Original)

**Context**: Need standardized chat protocol.

**Decision**: Use OpenAI ChatKit (`@openai/chatkit-react` + `openai-chatkit`).

**Rationale**:
- Battle-tested chat UI
- Handles streaming, threading, pagination
- Event protocol: `ThreadItemAdded`, `ThreadItemUpdated`, `ThreadItemDone`
- Native integration with OpenAI Agents SDK

**Tradeoffs**:
- ✅ Pro: Reduces dev time significantly
- ⚠️ Con: Limited customization of chat internals

---

### ADR-003: LiteLLM for Multi-Provider Support (Original)

**Context**: Use Gemini but maintain flexibility.

**Decision**: LiteLLM via `openai-agents[litellm]`.

**Rationale**:
- Single API for 100+ LLM providers
- Easy to switch: `gemini/gemini-2.0-flash` → `gpt-4o`
- Unified retry/fallback logic

---

### ADR-004: In-Memory Storage (Original)

**Context**: Thread persistence.

**Decision**:
- **Phase 1**: `MemoryStore` (Python dict)
- **Phase 2**: Neon Postgres

**Rationale**:
- Phase 1: No DB setup for hackathon
- Phase 2: Postgres for production durability

---

### ADR-005: ID Collision Fix (Original)

**Context**: Gemini/LiteLLM ID collisions overwrite messages.

**Decision**: Remap IDs in backend `respond()`.

**Implementation**:
```python
async def respond(self, items):
    old_id_to_new_id = {}
    async for event in stream_agent_response(agent, items):
        if event["type"] == "ThreadItemAdded":
            old_id = event["item"]["id"]
            new_id = f"{old_id}-{uuid.uuid4().hex[:8]}"
            old_id_to_new_id[old_id] = new_id
            event["item"]["id"] = new_id
        # Similar for Updated/Done events
        yield event
```

---

### ADR-006: Floating Chat Button UI (Original, see ADR-001 in history/adr/)

**Context**: Non-intrusive chatbot access.

**Decision**: FAB (bottom-right) + modal popup.

**Rationale**:
- Common pattern (Intercom, Drift)
- Mobile-friendly (full-screen on <768px)
- Compatible with Docusaurus components

## API Contract

### POST /chatkit (General RAG)

**Purpose**: Textbook-wide Q&A with vector search + LLM.

**Request** (ChatKit framework):
```json
{
  "thread_id": "thread_abc123",
  "items": [{"id": "item_001", "role": "user", "content": "What is forward kinematics?"}]
}
```

**Response** (`text/event-stream`):
```
event: thread.item.added
data: {"type": "ThreadItemAdded", "item": {"id": "item_002", "role": "assistant", "content": ""}}

event: thread.item.updated
data: {"type": "ThreadItemUpdated", "item": {"id": "item_002", "content": "Forward kinematics calculates..."}}

event: thread.item.done
data: {"type": "ThreadItemDone", "item": {"id": "item_002", "content": "Forward kinematics calculates the position... [Chapter 3, Section 2.1]", "citations": [{"chapter": 3, "section": "2.1", "url": "/docs/chapter-3/kinematics#forward-kinematics", "score": 0.92}]}}
```

---

### POST /chatkit/ask-selected (Selected-Text Mode)

**Purpose**: Answer using only highlighted text (no vector search).

**Request**:
```json
{
  "thread_id": "thread_abc123",
  "query": "Summarize this",
  "selected_text": "The Denavit-Hartenberg parameters provide...",
  "items": [...]
}
```

**Response**: Same SSE format, citation shows `{"text": "Based on your selected text"}`

**Validation**: 10-2000 words, else error

---

### GET /health

**Response**:
```json
{
  "status": "ok",
  "model": "gemini-2.0-flash",
  "qdrant_status": "connected",
  "qdrant_collection": "textbook_chunks",
  "qdrant_vectors": 15432
}
```

---

### GET /debug/threads

**Purpose**: Debug thread state (development only).

**Response**: JSON with all threads, items, metadata.

## Data Flow (General Q&A)

```
1. Student types: "What is inverse kinematics?"
   └──► ChatKit sends POST /chatkit

2. FastAPI Backend
   ├── Load thread history (last 10 messages)
   └──► RAG Pipeline (LangChain)

3. RAG Steps:
   a) Embed query (OpenAI text-embedding-3-small) → [0.123, -0.456, ..., 0.789]

   b) Qdrant search (top-k=5, threshold=0.7)
      └──► Returns 5 chunks:
          - chunk_1: "Inverse kinematics solves..." (score: 0.92, chapter 3, section 2.2)
          - chunk_2: "IK is the reverse..." (score: 0.88, chapter 3, section 2.2)
          - ... (3 more chunks)

   c) Construct prompt:
      - System: "Answer ONLY using textbook context. Include citations."
      - Context: [5 retrieved chunks]
      - Question: "What is inverse kinematics?"

   d) Gemini generates answer (streaming)
      └──► Tokens: "Inverse", " kinematics", " solves", ...

4. Stream Events (ChatKit protocol)
   ├── ThreadItemAdded (empty message)
   ├── ThreadItemUpdated (incremental tokens)
   └── ThreadItemDone (final + citations)

5. ChatKit React UI
   ├── Render message with citations
   ├── Citations: "[Chapter 3, Section 2.2]" (clickable)
   └── On click: navigate + scrollIntoView + highlight (3s yellow fade)

6. localStorage: Save thread_id
```

**Performance**: ~2 seconds (embedding 200ms + Qdrant 300ms + Gemini 1000ms + network 500ms)

## Data Flow (Selected-Text Mode)

```
1. Student highlights paragraph
   └──► useTextSelection hook: window.getSelection().toString()

2. Validate: 10-2000 words

3. Chat header: "📄 47 words selected"

4. Student types: "Explain this simpler"
   └──► POST /chatkit/ask-selected {query, selected_text}

5. Backend: NO vector search
   ├── Prompt: "Answer using ONLY the selected text"
   ├── Context: [selected text only]
   └──► Gemini generates (streaming)

6. Citation: "Based on your selected text" (not clickable)
```

**Performance**: ~1.5 seconds (faster, no embedding/search)

## Deployment (Phase 1: Single-Instance)

```
GitHub Pages (Docusaurus)
https://shumailaaijaz.github.io/physical-ai-textbook/
    │ HTTPS
    ├──► Textbook pages + ChatbotWidget (FAB + modal)
    │    └──► API: process.env.REACT_APP_API_URL
    │
    └──► Render/Railway (FastAPI)
         https://chatbot-api.onrender.com
         │
         ├── POST /chatkit (RAG)
         ├── POST /chatkit/ask-selected
         ├── GET /health
         └── GET /debug/threads
         │
         ├──► Qdrant Cloud (vector store)
         │    └──► textbook_chunks collection (15432 vectors)
         │
         └──► Neon Postgres (optional Phase 2)
              └──► threads, chunks_metadata tables
```

**Deployment Steps**:
1. Create Qdrant cluster → Copy URL + API key
2. Create Google AI Studio key → Copy GEMINI_API_KEY
3. Create OpenAI key → Copy OPENAI_API_KEY
4. Set env vars in Render dashboard
5. Run ingestion: `python backend/ingest.py` (one-time)
6. Deploy Docusaurus: `npm run deploy`
7. Test: `curl https://chatbot-api.onrender.com/health`

## Next Steps

1. ✅ **Phase 0 Complete**: See [research.md](./research.md) for detailed findings
2. ✅ **Phase 1 Complete**: See [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)
3. ⏭️ **Phase 2 Ready**: Run `/sp.tasks` to generate implementation task breakdown
4. ✅ **Constitution Re-Check**: All 5 principles validated ✅

## Complexity Tracking

No constitution violations. Inherent complexity justified:

| Complexity | Justification |
|------------|---------------|
| RAG Pipeline | Required for Source Fidelity (cannot use pre-trained knowledge) |
| Dual-Mode | Mandated by constitution Principle III |
| Citation System | Required for Explainability (Principle V) |
| Vector Search | Only viable approach for semantic search at scale (200+ pages) |
| Two Databases | Qdrant (vectors) + Neon (relations) optimized for different use cases |
| Backend/Frontend Separation | Different runtimes (Python async vs React) cannot be unified |

**Complexity Mitigation**:
- Use frameworks (ChatKit, LangChain, FastAPI) vs custom
- In-memory MemoryStore for Phase 1 (defer DB complexity)
- Single-file backend (`main.py`) and frontend (`App.tsx`)
- No microservices, message queues, or complex orchestration
