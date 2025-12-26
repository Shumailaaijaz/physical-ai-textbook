<!--
SYNC IMPACT REPORT
==================
Version change: [UNVERSIONED] → 1.0.0
Created: 2025-12-09

Rationale for version 1.0.0:
- Initial constitution creation for Integrated RAG Chatbot for Physical AI & Humanoid Robotics Textbook
- MAJOR version because this establishes foundational governance framework for hackathon deliverable

Modified principles: N/A (new creation)
Added sections:
- Core Principles (5 principles: Source Fidelity, RAG Pipeline Transparency, Dual-Mode Interaction, Zero Hallucination Tolerance, Explainability & Citations)
- Technical Standards (Stack Requirements, Architecture, Data Flow, API Contracts)
- Functional Requirements (Chunking & Ingestion, RAG Pipeline, Citation System, User Interaction Modes)
- Success Criteria (Hackathon Deliverables, Quality Metrics)
- Deployment Requirements
- Governance (Amendment & Compliance)

Templates requiring updates:
✅ Parent project templates at ../../.specify/templates/ - Compatible with chatbot subproject
⚠️  PENDING: Create chatbot-specific spec.md using parent templates
⚠️  PENDING: Create chatbot-specific plan.md using parent templates
⚠️  PENDING: Create chatbot-specific tasks.md using parent templates

Follow-up TODOs:
- Create initial feature spec at src/chatbot/specs/rag-integration/spec.md
- Define API contracts in src/chatbot/specs/rag-integration/contracts/
- Create ADR for Qdrant vs alternatives (Pinecone, Weaviate, Chroma)
- Create ADR for ChatKit integration approach
- Document data ingestion pipeline in plan.md
- Set up automated citation verification tests
- Create PHR workflow for chatbot development iterations
-->

# Integrated RAG Chatbot Constitution
## Physical AI & Humanoid Robotics Textbook Assistant

## Purpose

This constitution defines the complete technical, functional, and architectural requirements for building, integrating, and deploying a Retrieval-Augmented Generation (RAG) Chatbot embedded within the Docusaurus-based Physical AI & Humanoid Robotics Course textbook.

**Primary Goal**: Create an AI assistant that answers questions strictly from the book's content (entire textbook OR user-selected text), ensuring accurate, explainable, and source-grounded responses with zero hallucination tolerance.

**Target Audience**: Students and practitioners studying humanoid robotics who need instant, citation-backed answers without leaving their reading context.

## Core Principles

### I. Source Fidelity (Zero External Knowledge)

All chatbot responses MUST be grounded exclusively in the textbook content. The system is prohibited from using external knowledge, pre-trained model knowledge, or any information source beyond the ingested book chapters and user-selected text.

**Rationale**: Educational integrity demands that students receive answers verifiable against their assigned reading material. Introducing external information undermines trust, creates inconsistencies with course materials, and violates academic honesty expectations.

**Enforcement**:
- RAG pipeline MUST retrieve context ONLY from Qdrant vector store containing textbook embeddings
- System prompt MUST explicitly constrain model to provided context
- Responses that cannot be grounded in retrieved chunks MUST return "I cannot answer this based on the textbook content"
- No fallback to general model knowledge permitted

### II. RAG Pipeline Transparency

The chatbot MUST display which textbook paragraphs, chapters, and sections were used to generate each answer, including confidence/relevance scores.

**Rationale**: Transparency enables students to verify answers against source material, builds trust in the system, and supports active learning by encouraging readers to explore cited sections.

**Requirements**:
- Display top-k retrieved chunks (minimum 3, maximum 5) with source references
- Show chapter/section titles and page numbers (if applicable)
- Display similarity scores or confidence rankings
- Provide "View in textbook" links that scroll to exact paragraph

### III. Dual-Mode Interaction

The chatbot MUST support two distinct interaction modes:
1. **General Book Mode**: Retrieves relevant chunks from entire textbook
2. **Selected Text Mode**: Answers ONLY from user-highlighted text (no vector search)

**Rationale**: Different learning scenarios require different context scopes. General mode supports exploratory learning across chapters; selected text mode enables focused comprehension of specific passages without distraction from broader content.

**Requirements**:
- Mode selection MUST be unambiguous to user (clear UI indicator)
- Selected text mode MUST NOT perform vector search or retrieve additional context
- General mode MUST implement proper RAG pipeline with embeddings + retrieval
- Mode switching MUST preserve chat history but clearly mark mode transitions

### IV. Zero Hallucination Tolerance

The system MUST refuse to answer when insufficient context is available rather than generate plausible-sounding but ungrounded responses.

**Rationale**: In educational contexts, a confident but incorrect answer is worse than no answer. Students may memorize hallucinated information, leading to exam failures and loss of trust in AI-assisted learning tools.

**Implementation**:
- RAG retrieval threshold: minimum similarity score 0.7 (configurable)
- If no chunks meet threshold, return explicit refusal: "I cannot find relevant information in the textbook to answer this question."
- System prompt MUST include strong anti-hallucination instructions
- No creative gap-filling or inference beyond retrieved text

### V. Explainability & Citations

Every answer MUST include inline citations referencing specific textbook sections, formatted consistently and clickable.

**Rationale**: Academic integrity standards require attribution. Citations enable verification, support deeper learning through follow-up reading, and model proper scholarly communication practices.

**Citation Format**:
- Inline: `[Chapter X, Section Y.Z]` or `[Page N]`
- APA 7th edition for bibliography (inherited from parent textbook constitution)
- Clickable links to source locations in Docusaurus site
- Minimum 1 citation per answer, typically 2-3 for comprehensive responses

## Technical Standards

### Stack Requirements (Non-Negotiable)

The system MUST be built using this exact technology stack:

**AI + Chatbot Layer**:
- OpenAI ChatKit SDK for frontend chat UI
- OpenAI Agents SDK for backend agent orchestration
- Model: GPT-4o, GPT-4-turbo, or GPT-4.1 (fallback to GPT-3.5-turbo if budget-constrained)
- Text embeddings: `text-embedding-3-small` or `text-embedding-3-large`

**Backend Layer**:
- FastAPI (Python 3.11+) for all API endpoints
- LangChain or LlamaIndex for RAG orchestration (document chunking, retrieval, prompt engineering)
- Uvicorn as ASGI server

**Database Layer**:
- Neon Serverless Postgres for:
  - User settings (optional, hackathon may defer)
  - Chat history persistence
  - RAG metadata (chunk sources, timestamps)
  - Textbook chapter indexing
- Qdrant Cloud (Free Tier) for vector embeddings and similarity search

**Frontend Integration**:
- Docusaurus 3.x site (parent project)
- React component embedding ChatKit UI
- Popup modal OR side panel widget (design decision required)
- Text selection API for "answer from selected text" mode

**Deployment**:
- Backend: Render, Railway, Vercel, or Google Cloud Run
- Frontend: GitHub Pages (parent textbook site)
- Qdrant: Managed cloud instance (free tier: 1GB, 100k vectors)
- Neon: Serverless Postgres (free tier: 3 GB storage)

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Docusaurus Textbook Frontend                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ChatKit React Component (Popup/Side Panel)              │ │
│ │ - General question input                                │ │
│ │ - Text selection handler ("Answer from selection")      │ │
│ │ - Citation display with "View in textbook" links        │ │
│ └─────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ FastAPI Backend (Python)                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Endpoints:                                              │ │
│ │ POST /embed        - Ingest chapters, generate chunks   │ │
│ │ POST /search       - Vector similarity search (Qdrant)  │ │
│ │ POST /ask          - General RAG endpoint               │ │
│ │ POST /ask-selected - Selected-text RAG endpoint         │ │
│ │ GET  /history      - Chat session retrieval             │ │
│ │ POST /history      - Chat session persistence           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ RAG Pipeline (LangChain/LlamaIndex)                     │ │
│ │ 1. Query embedding (OpenAI text-embedding-3-small)      │ │
│ │ 2. Qdrant vector search (top-k=5, threshold=0.7)        │ │
│ │ 3. Context window construction                          │ │
│ │ 4. LLM call (GPT-4o) with anti-hallucination prompt     │ │
│ │ 5. Citation extraction and formatting                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────┬──────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────────┐ ┌─────────────────────────────────┐
│ Qdrant Cloud            │ │ Neon Postgres                   │
│ - Textbook embeddings   │ │ - Chat history                  │
│ - Similarity search     │ │ - Chunk metadata                │
│ - 1536-dim vectors      │ │ - Chapter index                 │
│ - COSINE distance       │ │ - User settings (optional)      │
└─────────────────────────┘ └─────────────────────────────────┘
```

### Data Flow

**1. Ingestion Phase (Pre-deployment)**:
```
Docusaurus .md/.mdx files
  → Parse & clean (remove frontmatter, navigation elements)
  → Chunk (RecursiveCharacterTextSplitter: 400 tokens, 100 overlap)
  → Generate embeddings (text-embedding-3-small)
  → Store in Qdrant (with metadata: chapter, section, page)
  → Store metadata in Neon (chunk_id, text, source, timestamp)
```

**2. General Question Flow**:
```
User question
  → Embed query (text-embedding-3-small)
  → Qdrant vector search (top-5, threshold=0.7)
  → Construct prompt: system + context + question
  → LLM call (GPT-4o, temp=0.2, max_tokens=500)
  → Extract citations from retrieved chunks
  → Return: {answer, citations, sources}
  → (Optional) Save to Neon chat history
  → Render in ChatKit UI with clickable citations
```

**3. Selected Text Flow**:
```
User highlights text + asks question
  → NO vector search (bypass Qdrant)
  → Construct prompt: system + selected_text + question
  → LLM call (GPT-4o, temp=0.2, max_tokens=300)
  → Return: {answer, citation: "from your selected text"}
  → Render in ChatKit UI
```

## Functional Requirements

### Chunking & Ingestion

**FR-001**: System MUST automatically parse all Docusaurus .md/.mdx files from `docs/` directory
- Preserve chapter hierarchy (infer from folder structure)
- Extract frontmatter metadata (title, description, chapter number)
- Remove Docusaurus-specific syntax (import statements, JSX components)

**FR-002**: System MUST chunk textbook content with overlap strategy
- Chunk size: 400 tokens (≈300 words, avoids context truncation)
- Chunk overlap: 100 tokens (ensures continuity across boundaries)
- Chunking strategy: RecursiveCharacterTextSplitter (respects sentence boundaries)
- Preserve metadata: {chapter, section, heading, source_file}

**FR-003**: System MUST generate embeddings for all chunks
- Model: `text-embedding-3-small` (1536 dimensions, $0.02/1M tokens)
- Batch processing: 100 chunks per API call (cost optimization)
- Error handling: Retry failed embeddings with exponential backoff

**FR-004**: System MUST store embeddings in Qdrant with metadata
- Collection: `textbook_chunks`
- Vector config: 1536-dim, COSINE distance
- Payload: {text, chapter, section, heading, source_file, page_number}
- Indexing: HNSW (default, optimized for similarity search)

**FR-005**: System MUST store chunk metadata in Neon Postgres
- Table: `chunks` (id UUID, text TEXT, source VARCHAR, chapter INT, section VARCHAR, created_at TIMESTAMP)
- Indexed columns: chapter, source (for filtering and analytics)
- Retention: Permanent (no automatic deletion)

### RAG Pipeline

**FR-006**: System MUST embed user queries before retrieval
- Use same embedding model as ingestion (`text-embedding-3-small`)
- Cache embeddings for identical queries (optional optimization)

**FR-007**: System MUST perform vector search with configurable parameters
- Top-k: 5 chunks (balances context richness vs. token budget)
- Similarity threshold: 0.7 (blocks irrelevant retrievals)
- Distance metric: COSINE similarity
- Filtering: Support chapter/section filters if user specifies scope

**FR-008**: System MUST construct context-aware prompts
- System prompt: "You are an assistant for the Physical AI & Humanoid Robotics textbook. Answer ONLY using the provided context. If context is insufficient, say 'I cannot answer this based on the textbook.' Include citations."
- Context section: Top-k retrieved chunks with source labels
- User question: Verbatim user input
- Temperature: 0.2 (minimize creativity, maximize factuality)
- Max tokens: 500 (concise answers, avoid rambling)

**FR-009**: System MUST generate citations from retrieved chunks
- Format: `[Chapter X, Section Y.Z]` inline after relevant sentence
- Link generation: Map source metadata to Docusaurus URL structure
- Minimum 1 citation per answer (if grounded in retrieved context)

**FR-010**: System MUST handle insufficient context gracefully
- If all retrieved chunks < 0.7 similarity: Return "I cannot answer this based on the textbook content."
- If question is out of scope (e.g., "What is the weather?"): Return "This question is outside the textbook's scope."
- Log unanswerable questions for content gap analysis

**FR-011**: System MUST save chat history to Neon Postgres (optional for hackathon)
- Table: `chat_history` (id UUID, user_id VARCHAR, question TEXT, answer TEXT, mode ENUM('general', 'selected'), created_at TIMESTAMP)
- Privacy: No PII storage without explicit user consent

### Citation System

**FR-012**: Citations MUST be clickable links to exact textbook locations
- URL format: `/docs/chapter-X/section-Y#heading-anchor`
- JavaScript: Smooth scroll to target paragraph, highlight for 3 seconds
- Fallback: If anchor missing, scroll to chapter top

**FR-013**: Citations MUST display source preview on hover
- Tooltip: First 100 characters of source paragraph
- Metadata: Chapter title, section name

**FR-014**: System MUST display relevance scores for transparency
- Show similarity score (0.70 - 1.00) next to each citation
- Visual indicator: Color gradient (red=0.7, yellow=0.85, green=1.0)

### User Interaction Modes

**FR-015**: General Book Mode MUST retrieve from entire textbook
- Default mode on chatbot open
- UI indicator: "Asking about: Entire Textbook"
- Behavior: Full RAG pipeline (embedding → Qdrant → LLM)

**FR-016**: Selected Text Mode MUST use only highlighted text
- Activation: User highlights text, clicks "Ask about selection" button
- UI indicator: "Asking about: Selected Text (23 words)"
- Behavior: Pass selected text directly as context (NO vector search)
- Constraint: Selected text length 10-2000 words (prevent abuse)

**FR-017**: System MUST preserve chat history across mode switches
- History display: Mark messages with mode badge (🌐 General | 📄 Selected)
- Context isolation: Mode switches do NOT share conversation context (each message independent)

**FR-018**: System MUST provide "New Chat" button to reset conversation
- Clears frontend state
- Generates new session ID (if history persistence enabled)

## Success Criteria

### Hackathon Deliverables (Must-Have)

**D-001**: Running Docusaurus textbook with embedded chatbot
- Chatbot widget visible on every textbook page
- Opens as modal popup or side panel
- Mobile responsive (tested on 375px viewport)

**D-002**: RAG answers with citations
- Minimum 3 test questions answered correctly with citations
- Citations clickable and navigate to correct textbook sections

**D-003**: Working FastAPI server
- Health check endpoint: `GET /health` returns `{"status": "ok", "model": "gpt-4o"}`
- All required endpoints functional (see FR-006 to FR-018)

**D-004**: Qdrant search + Neon Postgres integration
- Qdrant collection populated with textbook embeddings
- Neon database tables created and accessible
- Successful vector search returning relevant chunks

**D-005**: Ability to answer from selected text
- Text selection triggers "Ask about selection" UI
- Selected text mode bypasses vector search
- Answer grounded exclusively in selected text

**D-006**: Clean architecture & code organization
- Backend: Separate modules for ingestion, retrieval, endpoints
- Frontend: Reusable ChatKit component
- Configuration: Environment variables for API keys, DB URLs

**D-007**: Clear documentation
- README.md: Setup instructions, architecture diagram, API documentation
- `.env.example`: Required environment variables with descriptions
- Deployment guide: Step-by-step for Render + GitHub Pages

### Quality Metrics (Post-Hackathon Evaluation)

**Q-001**: Citation Accuracy ≥95%
- Manual review: 20 random answers, verify citations point to correct textbook sections
- Automated test: Parse citations, validate URLs resolve to expected pages

**Q-002**: Zero Hallucinations in Test Set
- Test set: 15 questions (10 in-scope, 5 out-of-scope)
- In-scope: All answers must be verifiable against cited textbook sections
- Out-of-scope: All answers must refuse with "I cannot answer..." message

**Q-003**: Response Latency <3 seconds (p95)
- Measured from user message submit to full answer rendered
- Includes: embedding (0.2s) + Qdrant search (0.3s) + LLM call (1.5s) + rendering (0.5s)

**Q-004**: User Satisfaction Survey (Post-Demo)
- Survey question: "Did the chatbot's citations help you verify answers?" (Yes/No)
- Target: ≥80% "Yes" responses from demo audience (minimum 10 respondents)

**Q-005**: Text Selection Mode Accuracy 100%
- Test: 5 questions each on 3 different selected passages
- Requirement: Zero answers that reference content outside selected text

## Deployment Requirements

### Environment Variables (Security)

All sensitive configuration MUST be stored in `.env` file (NEVER committed to Git):

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Qdrant Cloud
QDRANT_URL=https://xxxxx.qdrant.io
QDRANT_API_KEY=...

# Neon Postgres
NEON_DB_URL=postgresql://user:pass@host/dbname

# Application
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://physical-ai.github.io,http://localhost:3000
```

### Backend Deployment (FastAPI)

**Render / Railway**:
- Runtime: Python 3.11
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check: `GET /health`
- Auto-deploy: Push to `main` branch triggers deployment

**Resource Requirements**:
- Memory: 512 MB (sufficient for embedding + LLM calls)
- CPU: 0.5 vCPU (not compute-intensive, I/O-bound)
- Scaling: Not required for hackathon (single instance)

### Frontend Deployment (Docusaurus)

**GitHub Pages**:
- Build command: `npm run build` (parent textbook project)
- Deploy: Push to `gh-pages` branch or use GitHub Actions
- Custom domain: Optional (e.g., `textbook.physical-ai.dev`)

**ChatKit Integration**:
- Embed React component in Docusaurus theme
- API endpoint: Environment variable `REACT_APP_API_URL` (e.g., `https://chatbot.onrender.com`)

### Database Deployment

**Qdrant Cloud (Free Tier)**:
- Cluster: 1GB storage, 100k vectors (sufficient for 200-page textbook)
- Region: US/EU (choose closest to FastAPI deployment)
- API key: Generated in Qdrant dashboard

**Neon Postgres (Free Tier)**:
- Storage: 3 GB (sufficient for chat history + metadata)
- Compute: 0.25 vCPU (auto-scales to zero when idle)
- Backups: Daily automated snapshots (free tier)

## Ethical & Safety Requirements

**E-001**: Chatbot MUST avoid hallucinations through strict grounding
- Implemented via FR-010 (insufficient context refusals)

**E-002**: Answers MUST be based ONLY on book content
- Implemented via Principle I (Source Fidelity) and RAG pipeline constraints

**E-003**: System MUST include citation verification logic
- Pre-deployment: Automated tests validate citation URLs
- Post-deployment: Monitoring for broken citation links

**E-004**: System MUST NOT provide unsafe robot/AI instructions
- Textbook content review: Ensure no dangerous procedures documented
- (Note: This is primarily a content review issue, not a chatbot technical requirement)

**E-005**: User data privacy MUST be respected
- No user tracking without consent (hackathon may defer auth entirely)
- Chat history persistence: Opt-in only
- No third-party analytics without disclosure

## Governance

### Amendment Process

This constitution can be amended via:

1. **Proposal**: Document change in ADR via `/sp.adr <title>`
2. **Justification**: Explain why needed (technical debt, new requirements, hackathon feedback)
3. **Impact Analysis**: Assess affected components (ingestion pipeline, API contracts, frontend)
4. **Approval**: Requires consensus from project lead + 1 technical reviewer
5. **Migration Plan**: Update existing code/data to comply (e.g., re-embed chunks if chunking strategy changes)
6. **Version Bump**: Follow semantic versioning (see below)

### Compliance

- **All PRs** must pass constitution checks (enforced via `/sp.constitution` validation)
- **Spec-Kit Plus workflows** (`/sp.specify`, `/sp.plan`, `/sp.tasks`) MUST respect these principles
- **Constitution supersedes** conflicting guidance in README or informal discussions
- **Blocking violations**:
  - Hallucinated answers (fails Principle IV)
  - Missing citations (fails Principle V)
  - External knowledge usage (fails Principle I)
  - Non-reproducible deployment (fails Deployment Requirements)

### Version Control

**Version**: 1.0.0
**Ratified**: 2025-12-09
**Last Amended**: 2025-12-09

**Semantic Versioning Rules**:
- **MAJOR (X.0.0)**: Backward-incompatible changes (e.g., switch from Qdrant to Pinecone, remove citation requirement)
- **MINOR (1.X.0)**: New principles added (e.g., add multi-language support), new endpoints, expanded functionality
- **PATCH (1.0.X)**: Clarifications, typo fixes, non-semantic wording improvements, threshold adjustments

### Review Cadence

- **Pre-hackathon**: Weekly reviews during development sprint
- **Post-hackathon**: Monthly reviews for 3 months (incorporate demo feedback)
- **Maintenance**: Quarterly reviews (align with textbook content updates)

---

## Appendix: Glossary

- **RAG (Retrieval-Augmented Generation)**: AI technique combining vector search (retrieval) with LLM text generation
- **Embedding**: Numerical vector representation of text (1536 dimensions for `text-embedding-3-small`)
- **Vector Search**: Finding similar embeddings using distance metrics (COSINE, Euclidean)
- **Chunking**: Splitting long documents into smaller segments for embedding and retrieval
- **Context Window**: Text provided to LLM as background information (retrieved chunks + user question)
- **Hallucination**: LLM generating plausible but false information not grounded in provided context
- **Citation**: Reference to source material (chapter/section/page) supporting an answer
- **Qdrant**: Open-source vector database optimized for similarity search
- **Neon**: Serverless Postgres database with auto-scaling and branching
- **ChatKit**: OpenAI's SDK for building chat interfaces with AI assistants
- **Docusaurus**: Static site generator for documentation websites (used for textbook)
