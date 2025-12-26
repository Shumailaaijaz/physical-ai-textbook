# Implementation Plan: RAG Answer Generation Agent

**Feature**: 004-answer-generation-agent
**Created**: 2025-12-25
**Status**: Planning

## Technical Context

### Technology Stack

**Language/Version**: Python 3.11+
**Backend Framework**: FastAPI
**Agent Framework**: OpenAI Agents SDK / ChatKit SDK
**LLM Provider**: OpenRouter (for flexible model access)
**Vector Database**: Qdrant Cloud (Free Tier) - already populated from Phase 0
**Embeddings**: Cohere embed-multilingual-v3.0 (1024-dim) - already configured
**Session Storage**: Neon Serverless PostgreSQL (for conversation metadata, not content)
**Environment Management**: UV package manager

### Primary Dependencies

**Core**:
- `fastapi` - REST API framework for chatbot endpoint
- `openai` - OpenAI Agents SDK for multi-agent orchestration
- `httpx` - Async HTTP client for OpenRouter API calls
- `qdrant-client` - Vector search (retrieval agent integration)
- `cohere` - Query embedding generation (retrieval agent)
- `psycopg` - PostgreSQL driver for session metadata
- `python-dotenv` - Environment variable management
- `pydantic` - Data validation and settings

**Development**:
- `pytest` - Testing framework
- `pytest-asyncio` - Async test support
- `black` - Code formatting
- `ruff` - Linting

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Agent Orchestration Layer                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   Planner    │→ │  Retriever   │→ │  Answer    │  │  │
│  │  │    Agent     │  │    Agent     │  │ Generator  │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Tool Layer                           │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │  Qdrant    │  │   Cohere    │  │  PostgreSQL  │  │  │
│  │  │  Search    │  │  Embedding  │  │   Session    │  │  │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↑                                         ↓
    User Query                               Grounded Answer
  (+ optional selected text)                   (+ citations)
```

### Constraints

- **Read-only vector DB**: Qdrant is already populated from Phase 0, no writes to collection
- **Book-only knowledge**: Zero external search, zero web access, zero supplementary sources
- **Stateless conversations**: Each query is independent (session metadata for tracking only, not memory)
- **Free tier limits**:
  - Qdrant Cloud Free: 1GB storage, sufficient for textbook (already validated)
  - Neon Free: 512MB storage (metadata only, minimal usage)
  - OpenRouter: Pay-per-use (cost tracked per query)
- **No frontend**: API-only implementation (frontend integration out of scope)

### Integration Points

- **Upstream**: Relies on Phase 0 ingestion (rag_embeddings collection with 301 chunks)
- **Upstream**: Relies on SPEC3 retrieval validation (retrieve.py validates pipeline)
- **Downstream**: FastAPI `/query` endpoint consumed by web UI (not in scope)
- **External**: OpenRouter API for LLM access (requires API key)
- **External**: Cohere API for query embeddings (reuses Phase 0 key)

## Constitution Check

**Evaluation against Physical AI Textbook Constitution**:

### ✅ Principle I: Accuracy through Primary Source Verification

**How this feature aligns**:
- FR-003 mandates source citations (chapter, section, URL) for all answers
- FR-001/007 enforce using only book content (primary source)
- FR-002 preserves terminology exactly as in book (no paraphrasing from external sources)

**Rationale**: By grounding all answers in retrieved book content and requiring citations, this agent ensures every response is traceable to the authoritative textbook source.

### ✅ Principle II: Clarity for Academic & Practitioner Audience

**How this feature aligns**:
- FR-011 requires "clear, professional, technical tone appropriate for AI engineers and ML practitioners"
- Target audience (from spec) includes AI engineers, ML practitioners, researchers, advanced students

**Rationale**: Answer generation targets the same audience as the textbook itself, maintaining appropriate technical depth.

### ✅ Principle III: Reproducibility

**How this feature aligns**:
- Uses production-grade SDKs (OpenAI Agents, Qdrant Client, Cohere)
- Dependencies versioned and managed via UV
- Stateless design ensures consistent behavior across queries
- Configuration via environment variables (documented in quickstart)

**Rationale**: Any developer with access to the same ingested content can reproduce identical answer behavior.

### ✅ Principle IV: Rigor

**How this feature aligns**:
- FR-007/008 prohibit hallucinations and external knowledge injection
- FR-004/012/015 enforce strict refusal when content insufficient
- Success criteria SC-001 requires 100% grounding with 0% hallucinations

**Rationale**: The agent maintains the same rigor as the source material by refusing to answer when evidence is insufficient, rather than generating plausible-but-unverified content.

### ✅ Principle V: Practicality & Inclusivity

**How this feature aligns**:
- Free tier infrastructure (Qdrant Cloud Free, Neon Free)
- OpenRouter pay-per-use model (cost-effective for student usage)
- No expensive GPU requirements (cloud-based LLM inference)
- API-first design allows multilingual frontend integration (Urdu support at UI layer)

**Rationale**: By using serverless/cloud infrastructure with free tiers, the chatbot remains accessible to students without requiring dedicated hardware.

### Constitution Compliance Summary

**Status**: ✅ **PASS** - All 5 principles satisfied

**No violations detected**. The RAG answer generation agent reinforces the constitution by:
1. Enforcing source traceability (citations)
2. Maintaining audience-appropriate technical communication
3. Using reproducible, production-grade tooling
4. Preventing hallucinations through strict grounding
5. Remaining economically accessible via free/low-cost infrastructure

## Agent Orchestration Design

### Agent Roles and Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLANNER AGENT                                │
│  Role: Route user input to appropriate workflow                 │
│  Tools: None (decision logic only)                              │
│  Input: User query + optional selected_text flag                │
│  Output: Workflow selection (standard_rag | selected_text_only) │
│  Prohibitions: Cannot query Qdrant, cannot generate answers     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   RETRIEVER AGENT                               │
│  Role: Perform vector search and return ranked chunks           │
│  Tools: search_qdrant(query, top_k, selected_text?)             │
│  Input: User query + workflow mode                              │
│  Output: List[RetrievedChunk] with metadata                     │
│  Prohibitions: Cannot generate embeddings (calls tool),         │
│                cannot synthesize answers                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 ANSWER GENERATOR AGENT                          │
│  Role: Synthesize grounded answer from retrieved chunks         │
│  Tools: None (receives chunks as input, no tool calls)          │
│  Input: User query + List[RetrievedChunk] + mode                │
│  Output: GroundedAnswer (text + citations) OR RefusalMessage    │
│  Prohibitions: Cannot call retrieval tools, cannot use external │
│                knowledge, must refuse if grounding insufficient  │
└─────────────────────────────────────────────────────────────────┘
```

### Tool Definitions

**Tool 1: `search_qdrant`**
- **Agent**: Retriever Agent
- **Purpose**: Execute vector similarity search
- **Inputs**:
  - `query` (string): User question
  - `top_k` (int, default=5): Number of chunks to retrieve
  - `selected_text` (string | null): User-highlighted text (if selected-text-only mode)
- **Process**:
  1. Generate query embedding via Cohere embed-multilingual-v3.0
  2. If `selected_text` provided: Return only that text as single "chunk" (bypass Qdrant)
  3. Else: Call Qdrant `query_points()` with embedding and top_k
  4. Extract text + metadata (chapter, section, source_url, score) from results
- **Output**: `List[RetrievedChunk]`
- **Error handling**: Empty results → return empty list (not an error, allows refusal downstream)

### Workflow Modes

**Mode 1: Standard RAG** (User Stories P0, P2, P3)
```
User Query
  ↓
Planner: Detect no selected_text → route to "standard_rag"
  ↓
Retriever: search_qdrant(query, top_k=5, selected_text=null)
  → Returns 0-5 chunks from Qdrant
  ↓
Answer Generator:
  - If chunks.length == 0: Return refusal (FR-004, FR-012)
  - If chunks.length > 0 but low relevance: Evaluate sufficiency, refuse if needed (FR-015)
  - Else: Synthesize answer + citations (FR-001, FR-002, FR-003)
```

**Mode 2: Selected-Text-Only** (User Story P1)
```
User Query + Selected Text
  ↓
Planner: Detect selected_text present → route to "selected_text_only"
  ↓
Retriever: search_qdrant(query, top_k=1, selected_text="user highlighted passage")
  → Returns single "chunk" containing only selected text (no Qdrant call)
  ↓
Answer Generator (STRICT MODE):
  - Ignore all other chunks (even if retriever somehow returned them)
  - Use ONLY the selected text chunk
  - If answer not in selected text: Return "The selected text does not contain this information" (FR-006)
  - Else: Synthesize answer from selected text only (FR-005)
```

### Agent Handoff Protocol

**Planner → Retriever**:
```json
{
  "query": "How does ROS 2 work?",
  "mode": "standard_rag",
  "top_k": 5,
  "selected_text": null
}
```

**Retriever → Answer Generator**:
```json
{
  "query": "How does ROS 2 work?",
  "mode": "standard_rag",
  "chunks": [
    {
      "chunk_id": "abc123",
      "text": "ROS 2 is the nervous system of modern robots...",
      "chapter": "Chapter 2: ROS 2 Fundamentals",
      "section": "Learning Objectives",
      "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/docs/02-ros2-fundamentals",
      "similarity_score": 0.672
    },
    ...
  ]
}
```

**Answer Generator → User**:
```json
{
  "answer": "ROS 2 is the nervous system of modern robots, connecting sensors, actuators, and AI into a unified organism. It provides...",
  "citations": [
    {
      "chapter": "Chapter 2: ROS 2 Fundamentals",
      "section": "Learning Objectives",
      "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/docs/02-ros2-fundamentals"
    }
  ],
  "status": "success"
}
```

Or (refusal case):
```json
{
  "answer": null,
  "citations": [],
  "status": "refused",
  "reason": "The provided book content does not contain sufficient information to answer this question"
}
```

## Grounding & Hallucination Prevention

### Answer Generation Constraints (System Prompt)

The Answer Generator agent will receive a system prompt enforcing:

1. **Strict Content Scope**:
   - "You may only use information from the provided retrieved chunks"
   - "Do not use your training data or external knowledge"
   - "If the chunks do not contain sufficient information, you MUST refuse"

2. **Terminology Preservation**:
   - "Use the exact terminology from the book, even if technically imprecise"
   - "Do not rephrase technical terms with synonyms"

3. **Citation Requirements**:
   - "Include a citation for every claim"
   - "Format: (Chapter X, Section Y)"
   - "Include source URLs when available"

4. **Refusal Triggers**:
   - Empty chunks list → Immediate refusal with FR-004 message
   - Low-quality chunks (all scores < 0.4) → Evaluate and likely refuse
   - Question requires reasoning not in text → Refuse with FR-015 message
   - Selected-text mode + answer not in selection → FR-006 message

5. **Prohibition on Elaboration**:
   - "Do not add examples not present in the chunks"
   - "Do not provide background context not in the chunks"
   - "Do not explain concepts beyond what the book states"

### Validation Checks (Post-Generation)

After answer generation, apply these checks:

**Check 1: Citation Completeness**
- Every factual claim must map to a citation
- At least one citation required for non-refusal answers
- Fail if answer contains book content but zero citations

**Check 2: Term Preservation**
- Extract technical terms from retrieved chunks
- Verify answer uses same terms (no synonym substitution)
- Fail if answer rephrases key terminology

**Check 3: Content Containment**
- All sentences in answer must be semantically similar to chunk sentences
- Use embedding similarity check (answer sentence vs. chunk text)
- Fail if answer introduces novel claims (similarity < 0.7)

**Check 4: Mode Compliance** (Selected-Text-Only)
- In selected-text mode: Verify answer references only selected text chunk
- Fail if answer pulls from non-selected chunks

### Refusal Decision Tree

```
Retrieved chunks.length == 0?
  ├─ YES → Refuse (FR-004 message)
  └─ NO → Check relevance

All chunks.score < 0.4?
  ├─ YES → Refuse (low relevance)
  └─ NO → Check sufficiency

Question requires multi-hop reasoning?
  ├─ YES → Check if reasoning path in chunks
  │         ├─ YES → Generate answer
  │         └─ NO → Refuse (FR-015)
  └─ NO → Generate answer

Selected-text mode + answer not in selection?
  └─ YES → Refuse (FR-006 message)
```

## Data Flow Architecture

### API Endpoint Design

**POST /api/query**

**Request**:
```json
{
  "query": "What is Physical AI?",
  "selected_text": null,  // or "highlighted passage..."
  "top_k": 5,  // optional, default=5
  "session_id": "uuid-v4"  // optional, for tracking
}
```

**Response** (Success):
```json
{
  "status": "success",
  "answer": {
    "text": "Physical AI combines embodied intelligence with real-world interaction...",
    "citations": [
      {
        "chapter": "Chapter 1: Introduction to Physical AI",
        "section": "Learning Objectives",
        "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/docs/01-introduction-to-physical-ai"
      }
    ],
    "mode": "standard_rag"
  },
  "metadata": {
    "chunks_retrieved": 5,
    "processing_time_ms": 1234,
    "session_id": "uuid-v4"
  }
}
```

**Response** (Refusal):
```json
{
  "status": "refused",
  "answer": null,
  "reason": "The provided book content does not contain sufficient information to answer this question",
  "metadata": {
    "chunks_retrieved": 0,
    "processing_time_ms": 456,
    "session_id": "uuid-v4"
  }
}
```

**Response** (Error):
```json
{
  "status": "error",
  "error": {
    "code": "RETRIEVAL_FAILED",
    "message": "Failed to connect to Qdrant",
    "details": "Connection timeout after 5s"
  }
}
```

### Session Metadata Storage (PostgreSQL)

**Schema** (lightweight tracking):
```sql
CREATE TABLE query_sessions (
  session_id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  user_ip VARCHAR(45),  -- for rate limiting only
  query_count INTEGER DEFAULT 0
);

CREATE TABLE queries (
  query_id UUID PRIMARY KEY,
  session_id UUID REFERENCES query_sessions(session_id),
  query_text TEXT NOT NULL,
  selected_text TEXT,  -- null if standard mode
  mode VARCHAR(20),  -- 'standard_rag' | 'selected_text_only'
  status VARCHAR(20),  -- 'success' | 'refused' | 'error'
  chunks_retrieved INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- No storage of answers or book content (all in Qdrant)
```

**Purpose**: Track usage patterns, identify common refusals, monitor performance. Not used for conversation memory (stateless design).

## Implementation Phases

### Phase 0: Environment Setup

**Prerequisites**: Phase 0 ingestion complete, SPEC3 validation passing

**Tasks**:
1. Create `src/chatbot/backend/agents/` directory structure
2. Set up FastAPI project skeleton
3. Configure environment variables:
   - `OPENROUTER_API_KEY` - LLM access
   - `QDRANT_URL`, `QDRANT_API_KEY` - Vector DB (reuse from Phase 0)
   - `COHERE_API_KEY` - Embeddings (reuse from Phase 0)
   - `NEON_DATABASE_URL` - PostgreSQL session storage
   - `ALLOWED_ORIGINS` - CORS for web UI integration
4. Initialize PostgreSQL schema (query_sessions, queries tables)
5. Verify connectivity to all external services

**Validation**: Run `retrieve.py` from SPEC3 to confirm Qdrant pipeline working

### Phase 1: Retriever Agent Implementation

**Scope**: Implement search_qdrant tool and retriever agent logic

**Tasks**:
1. Create `tools/search_qdrant.py`:
   - Cohere embedding generation
   - Qdrant query_points() call
   - Selected-text bypass logic (return text as "chunk" without search)
   - Metadata extraction and validation
2. Create `agents/retriever.py`:
   - Agent definition with search_qdrant tool binding
   - Input validation (query length, top_k range)
   - Error handling for Qdrant timeouts
3. Unit tests:
   - Test standard RAG mode (query → embeddings → Qdrant → chunks)
   - Test selected-text mode (text → bypass → single chunk)
   - Test empty results handling
   - Test malformed metadata handling

**Validation**: Retriever returns expected chunk format with all metadata fields

### Phase 2: Answer Generator Agent Implementation

**Scope**: Implement grounded answer synthesis with citation

**Tasks**:
1. Create `agents/answer_generator.py`:
   - System prompt template with grounding constraints
   - Citation extraction logic
   - Refusal decision tree implementation
   - OpenRouter API integration (via OpenAI-compatible endpoint)
2. Implement validation checks:
   - Citation completeness check
   - Term preservation check (compare answer vs. chunks)
   - Content containment check (embedding similarity)
   - Mode compliance check (selected-text-only enforcement)
3. Unit tests:
   - Test standard RAG answer generation + citations
   - Test selected-text-only mode (ignore non-selected chunks)
   - Test refusal cases (empty chunks, low relevance, insufficient grounding)
   - Test multi-source citation synthesis
   - Test hallucination prevention (validate no external knowledge)

**Validation**: Answer generator passes all FR-001 through FR-015 requirements

### Phase 3: Planner Agent & Orchestration

**Scope**: Implement routing logic and agent coordination

**Tasks**:
1. Create `agents/planner.py`:
   - Workflow mode detection (standard_rag vs. selected_text_only)
   - Agent handoff logic (planner → retriever → answer generator)
   - OpenAI Agents SDK orchestration setup
2. Implement FastAPI `/api/query` endpoint:
   - Request validation (Pydantic models)
   - Session tracking (PostgreSQL insert)
   - Agent orchestration invocation
   - Response formatting (success/refused/error cases)
   - Error handling and logging
3. Integration tests:
   - Test end-to-end standard RAG flow
   - Test end-to-end selected-text-only flow
   - Test refusal scenarios
   - Test error scenarios (Qdrant down, OpenRouter timeout)

**Validation**: Full workflow passes all 4 user story acceptance scenarios

### Phase 4: Performance & Observability

**Scope**: Add logging, monitoring, and optimization

**Tasks**:
1. Implement structured logging:
   - Request/response logging (exclude PII)
   - Agent handoff tracking
   - Refusal reason logging (for improvement)
   - Performance metrics (latency per agent)
2. Add caching layer:
   - Cache query embeddings (same query = reuse embedding)
   - TTL: 1 hour (Cohere API cost reduction)
3. Add rate limiting:
   - Per session_id: 10 queries/minute
   - Per IP: 20 queries/minute
4. Create health check endpoint:
   - `GET /health` → Check Qdrant, OpenRouter, PostgreSQL connectivity

**Validation**: System handles 10 concurrent queries without degradation

## Risks and Mitigations

### Risk 1: Hallucination Despite Constraints (HIGH IMPACT)

**Likelihood**: Medium (LLMs are prone to hallucination even with system prompts)

**Impact**: Violates FR-007, FR-008, SC-001 (zero hallucination requirement)

**Mitigation**:
- **Primary**: Post-generation validation checks (citation, term preservation, content containment)
- **Secondary**: Use stricter LLM models (GPT-4, Claude 3 Opus) via OpenRouter for higher accuracy
- **Tertiary**: Manual review of first 100 answers to calibrate validation thresholds
- **Fallback**: If validation detects hallucination, trigger refusal instead of returning answer

**Detection**: Automated checks + manual spot-checking (first deployment week)

### Risk 2: Refusal Over-Sensitivity (MEDIUM IMPACT)

**Likelihood**: High (strict grounding may cause false refusals)

**Impact**: Poor user experience, violates SC-007 (answers should be generated when possible)

**Mitigation**:
- **Primary**: Calibrate refusal decision tree thresholds (score < 0.4 may be too strict)
- **Secondary**: Log all refusals with retrieved chunks for analysis
- **Tertiary**: Implement "borderline" response: "The book content is limited on this topic, but here's what it says: [minimal answer]"

**Detection**: Track refusal rate (should be <20% of queries based on book scope)

### Risk 3: OpenRouter Cost Escalation (MEDIUM IMPACT)

**Likelihood**: Medium (depends on usage volume)

**Impact**: Budget constraints if chatbot becomes popular

**Mitigation**:
- **Primary**: Rate limiting (10 queries/min per session)
- **Secondary**: Use cheaper models (GPT-3.5-turbo) for initial deployment, upgrade if quality issues
- **Tertiary**: Implement query length limits (max 500 chars) to reduce token costs
- **Monitoring**: Alert if daily cost > $5

**Detection**: Daily cost tracking via OpenRouter API

### Risk 4: Selected-Text Mode Usability Issues (LOW IMPACT)

**Likelihood**: Medium (users may expect broader answers even when text selected)

**Impact**: User frustration with strict mode enforcement

**Mitigation**:
- **Primary**: Clear UI messaging: "Answering based only on your selected text"
- **Secondary**: Offer "expand search" button to switch to standard mode
- **Frontend responsibility**: Out of scope for this implementation (API provides both modes)

**Detection**: User feedback monitoring (post-deployment)

### Risk 5: Qdrant Free Tier Limits (LOW IMPACT)

**Likelihood**: Low (301 chunks << 1GB limit)

**Impact**: Service disruption if limit exceeded

**Mitigation**:
- **Primary**: Monitor collection size (currently 301 chunks, plenty of headroom)
- **Secondary**: Qdrant Cloud provides usage alerts
- **Tertiary**: Paid tier upgrade path documented ($25/month)

**Detection**: Automated Qdrant dashboard monitoring

## Success Metrics

### Functional Metrics (from Success Criteria)

- **SC-001**: Grounding accuracy = 100%
  - **Measurement**: Manual review of 100 random answers (0 hallucinations detected)
  - **Target**: 100/100 pass validation checks

- **SC-002**: Citation completeness = 100%
  - **Measurement**: Automated check (all non-refusal answers have ≥1 citation)
  - **Target**: 100% of answers include citations

- **SC-003**: Refusal accuracy = 100%
  - **Measurement**: Test with 20 out-of-scope questions (e.g., "How do I train GPT-4?")
  - **Target**: 20/20 receive refusal messages (no attempted answers)

- **SC-004**: Selected-text mode compliance = 100%
  - **Measurement**: Test with 10 queries + selected text (verify no non-selected chunks used)
  - **Target**: 10/10 answers use only selected text

- **SC-005**: Terminology preservation = 100%
  - **Measurement**: Manual review of 50 answers (check for synonym substitution)
  - **Target**: 0 instances of term replacement (e.g., "ROS 2" not changed to "Robot Operating System 2")

- **SC-006**: Multi-source citations present
  - **Measurement**: Test with 10 multi-chapter questions
  - **Target**: ≥8/10 answers cite all relevant chapters

- **SC-007**: Refusal latency < 1 second
  - **Measurement**: Average latency for empty retrieval results
  - **Target**: <1000ms (no expensive LLM call for empty results)

### Performance Metrics

- **Latency**: End-to-end query response time
  - **Target**: P95 < 3 seconds (embedding 500ms + Qdrant 500ms + LLM 1.5s + overhead 500ms)

- **Throughput**: Concurrent query handling
  - **Target**: 10 concurrent queries without degradation

- **Availability**: Uptime
  - **Target**: 99% uptime (dependent on Qdrant, OpenRouter, Neon availability)

### Cost Metrics

- **OpenRouter cost per query**:
  - **Target**: <$0.01 per query (GPT-3.5-turbo: ~$0.002 for 1000 tokens)

- **Total monthly cost** (assuming 1000 queries/month):
  - **Target**: <$20/month (OpenRouter $10, Neon $0 on free tier, Qdrant $0 on free tier)

## Next Steps

1. **Task Generation**: Run `/sp.tasks` to break down implementation into atomic tasks
2. **Research Phase**: If any unknowns remain, execute research.md generation
3. **Data Modeling**: Create data-model.md with entity definitions
4. **API Contracts**: Define OpenAPI schema for `/api/query` endpoint
5. **Implementation**: Execute tasks in order (Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4)
6. **Testing**: Validate against all 7 success criteria (SC-001 through SC-007)
7. **Deployment**: Deploy to production environment (Neon + Fly.io/Render for FastAPI)

## Dependencies Summary

**Upstream (Must be complete)**:
- ✅ Phase 0: Content Ingestion (rag_embeddings collection with 301 chunks)
- ✅ SPEC3: Retrieval Validation (retrieve.py validates pipeline)

**External Services (Must be configured)**:
- ⏳ OpenRouter account + API key
- ⏳ Neon PostgreSQL database provisioned
- ✅ Qdrant Cloud cluster (existing)
- ✅ Cohere API key (existing)

**Out of Scope (Not blocking this implementation)**:
- Frontend web UI integration
- Multi-turn conversation memory
- User authentication system
- Answer quality A/B testing
- Urdu language support (handled at frontend layer)
