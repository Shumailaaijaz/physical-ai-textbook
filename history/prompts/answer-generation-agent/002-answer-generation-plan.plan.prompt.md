---
id: 002
title: Answer Generation Agent Planning
stage: plan
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: answer-generation-agent
branch: main
user: developer
command: /sp.plan
labels: ["plan", "rag", "agent-orchestration", "grounding", "architecture"]
links:
  spec: specs/004-answer-generation-agent/spec.md
  plan: specs/004-answer-generation-agent/plan.md
  tasks: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-answer-generation-agent/plan.md
  - specs/004-answer-generation-agent/research.md
  - specs/004-answer-generation-agent/data-model.md
  - specs/004-answer-generation-agent/contracts/api.openapi.yaml
  - specs/004-answer-generation-agent/quickstart.md
tests:
  - Constitution check PASS (all 5 principles satisfied)
  - 7 research questions resolved (agent framework, LLM selection, citation format, refusal threshold, selected-text mode, session schema, error handling)
  - 9 entities defined with validation rules
  - OpenAPI contract complete (2 endpoints, 9 schemas)
  - Quickstart guide with troubleshooting
---

## Prompt

/sp.plan RAG AGENT ORCHESTRATION PLAN - You are a planning and orchestration agent responsible for producing a clear execution plan to build an AI agent with retrieval-augmented generation (RAG) capabilities embedded within a published technical book. Focus on agent orchestration, tool-based retrieval, grounded answer generation, and educational correctness. System assumes Cohere embeddings, Qdrant vector DB, FastAPI backend, OpenAI Agents / ChatKit SDK, Neon PostgreSQL for metadata, and no external search. Plan must cover agent orchestration (retriever, answer generator, planner), tool-based retrieval flow, book constraints (strict grounding, no external knowledge), and validation controls (hallucination prevention, refusal logic).

## Response snapshot

Created comprehensive implementation plan for RAG Answer Generation Agent with strict grounding enforcement and multi-agent orchestration.

**Planning Artifacts Generated**:

1. **plan.md**: Technical architecture and agent orchestration design
   - **Technology Stack**: FastAPI + OpenAI Agents SDK + OpenRouter + Qdrant + Cohere + Neon PostgreSQL
   - **3-Agent Architecture**:
     - Planner Agent: Routes to standard_rag vs. selected_text_only workflows
     - Retriever Agent: search_qdrant tool (embedding generation + vector search)
     - Answer Generator Agent: Grounded synthesis with citation extraction (no tool access)
   - **Constitution Check**: ✅ All 5 principles satisfied
     - Principle I (Accuracy): Citations enforce traceability
     - Principle II (Clarity): Technical tone for AI/ML audience
     - Principle III (Reproducibility): Production SDKs, versioned deps, stateless design
     - Principle IV (Rigor): Zero hallucination tolerance, strict refusal logic
     - Principle V (Practicality): Free tier infrastructure (Qdrant Cloud Free, Neon Free)
   - **Implementation Phases**:
     - Phase 0: Environment setup (FastAPI, PostgreSQL schema, connectivity verification)
     - Phase 1: Retriever agent (search_qdrant tool with Cohere + Qdrant)
     - Phase 2: Answer generator (grounded synthesis with validation checks)
     - Phase 3: Planner & orchestration (workflow routing, FastAPI /api/query endpoint)
     - Phase 4: Performance & observability (logging, caching, rate limiting, health check)
   - **5 Risks & Mitigations**:
     1. Hallucination (post-generation validation, model upgrade path)
     2. Refusal over-sensitivity (threshold calibration, borderline response strategy)
     3. OpenRouter cost escalation (rate limiting, cheaper models, cost alerts)
     4. Selected-text usability (clear UI messaging, expand search option)
     5. Qdrant free tier limits (usage monitoring, upgrade path)

2. **research.md**: 7 research questions resolved
   - **R1 - Agent Framework**: OpenAI Agents SDK via OpenRouter (vs. LangChain, custom)
     - Rationale: Native tool calling, OpenRouter compatibility, lighter than LangChain
   - **R2 - LLM Selection**: GPT-3.5-turbo → Claude 3 Sonnet upgrade path
     - Phase 1: GPT-3.5-turbo ($0.002/1K tokens) for MVP
     - Phase 2: Claude 3 Sonnet ($0.003/1K tokens) if >5% hallucination rate
   - **R3 - Citation Format**: Structured JSON with end-of-answer citations
     - Format: `{text, citations: [{chapter, section, source_url, referenced_text}]}`
     - Rationale: Frontend flexibility, claim-to-source mapping
   - **R4 - Refusal Threshold**: Top-1 score < 0.4
     - Conservative threshold (prefer refusal over hallucination)
     - Monitored for calibration (log borderline cases 0.35-0.45)
   - **R5 - Selected-Text Mode**: Tool conditional logic in retriever
     - If selected_text provided: Return as single "chunk" (score=1.0, bypass Qdrant)
     - Else: Generate embedding and query Qdrant
   - **R6 - PostgreSQL Schema**: Minimal metadata only (no answers, no chunks)
     - Tables: query_sessions (rate limiting), queries (analytics)
     - Privacy: Store query text + selected_text_length (not content)
     - Retention: 90 days (GDPR compliance)
   - **R7 - Error Handling**: Graceful failures with actionable messages
     - Qdrant timeout → 503 + retry suggestion
     - Validation failure → Refusal (better than hallucination)
     - Rate limit → 429 + retry_after

3. **data-model.md**: 9 entities with validation rules
   - **QueryRequest**: User input (query, selected_text?, top_k, session_id?)
   - **PlannedWorkflow**: Routing decision (mode: standard_rag | selected_text_only)
   - **QueryEmbedding**: 1024-dim vector (ephemeral, not stored)
   - **RetrievedChunk**: Single chunk (chunk_id, text, chapter?, section?, source_url?, similarity_score)
   - **Citation**: Source attribution (chapter?, section?, source_url?, referenced_text?)
   - **GroundedAnswer**: Successful response (text, citations[≥1], mode)
   - **RefusalMessage**: Structured refusal (reason, refusal_type)
   - **QueryResponse**: API envelope (status: success|refused|error, answer?, refusal?, error?)
   - **ErrorDetail**: Error info (code, message, details?, retry_after?)
   - **Key Invariants**:
     - GroundedAnswer requires ≥1 citation
     - QueryResponse has exactly one of: answer, refusal, error
     - selected_text non-null iff mode=selected_text_only
     - RetrievedChunk.similarity_score ∈ [0.0, 1.0]
     - RefusalMessage.reason must match FR-004 or FR-006 messages

4. **contracts/api.openapi.yaml**: Complete OpenAPI 3.0 spec
   - **Endpoints**:
     - POST /v1/query (main chatbot endpoint)
     - GET /health (system health check)
   - **Request/Response Examples**:
     - Standard RAG (query → answer + citations)
     - Selected-text mode (query + selected_text → focused answer)
     - Refusal (insufficient grounding)
     - Errors (Qdrant timeout, rate limit, validation failure)
   - **9 Schemas**: QueryRequest, QueryResponse, GroundedAnswer, Citation, RefusalMessage, ErrorDetail, ResponseMetadata, ErrorResponse, Health
   - **HTTP Status Codes**:
     - 200: Success (includes success/refused/error in JSON)
     - 400: Invalid request (validation failure)
     - 429: Rate limit exceeded
     - 503: Service unavailable

5. **quickstart.md**: Complete usage guide with troubleshooting
   - **Prerequisites**: Qdrant (existing), Cohere (existing), OpenRouter (new), Neon PostgreSQL (new)
   - **Installation**: `uv add fastapi openai httpx psycopg uvicorn`
   - **Configuration**: 5 new environment variables (OPENROUTER_API_KEY, OPENROUTER_MODEL, NEON_DATABASE_URL, ALLOWED_ORIGINS, RATE_LIMIT_*)
   - **Basic Usage**:
     - Start server: `uv run uvicorn main:app --reload --port 8000`
     - Test standard RAG: `curl -X POST http://localhost:8000/v1/query -d '{"query": "How does ROS 2 work?"}'`
     - Test selected-text: `curl ... -d '{"query": "What are topics?", "selected_text": "..."}'`
     - Test refusal: `curl ... -d '{"query": "How do I train GPT-4?"}'`
   - **Troubleshooting**: 5 common errors with solutions
     1. OpenRouter API key invalid
     2. PostgreSQL connection failed
     3. Rate limit exceeded
     4. Hallucination detected (validation failure → correct refusal behavior)
     5. Qdrant timeout
   - **Testing**: Unit tests (retriever, answer generator, planner), integration tests (e2e workflow)
   - **Production Deployment**: Fly.io/Render example, HTTPS setup, cost monitoring ($2-15/month estimated)
   - **Best Practices**: Start with GPT-3.5-turbo, monitor refusal rate (<20% target), review hallucinations (first 100 answers), aggressive rate limiting

**Technical Decisions Documented**:

1. **OpenAI Agents SDK over LangChain**:
   - Lighter framework, native tool calling, cleaner grounding enforcement
   - OpenRouter provides OpenAI-compatible API

2. **GPT-3.5-turbo → Claude 3 Sonnet Upgrade Path**:
   - MVP with GPT-3.5-turbo for cost efficiency ($0.002/1K tokens)
   - Upgrade to Claude 3 Sonnet ($0.003/1K tokens) if >5% hallucination rate
   - Fallback to GPT-4 ($0.03/1K tokens) only if Claude fails

3. **Tool Conditional Logic for Selected-Text Mode**:
   - Single retriever agent with conditional logic (vs. separate agents)
   - If selected_text: Return as single chunk (bypass Qdrant)
   - Maintains clean agent boundaries (planner routes, retriever retrieves, answer generator synthesizes)

4. **Post-Generation Validation Checks**:
   - Citation completeness (≥1 citation required)
   - Term preservation (no synonym substitution)
   - Content containment (embedding similarity check)
   - Mode compliance (selected-text-only enforcement)
   - **Fallback**: If validation fails, trigger refusal instead of returning answer

5. **PostgreSQL Minimal Schema**:
   - Store only metadata (no answers, no chunks)
   - Privacy-preserving (selected_text_length only, not content)
   - 90-day retention for GDPR compliance

6. **Refusal Threshold = 0.4 (Top-1 Score)**:
   - Conservative (prefer refusal over hallucination)
   - Monitored with borderline case logging (0.35-0.45)
   - Adjustable based on production refusal rate

**Agent Orchestration Design**:

```
Planner Agent (routing only, no tools)
  ↓ (detects selected_text? → mode)
Retriever Agent (search_qdrant tool)
  ↓ (embedding + Qdrant OR selected text passthrough)
  → List[RetrievedChunk]
  ↓
Answer Generator Agent (no tools, receives chunks)
  ↓ (grounded synthesis + validation)
  → GroundedAnswer OR RefusalMessage
  ↓
FastAPI /v1/query endpoint
  → QueryResponse(status, answer|refusal|error, metadata)
```

**Grounding & Hallucination Prevention Strategy**:

1. **System Prompt Constraints**:
   - "Use only provided chunks, no external knowledge"
   - "Preserve exact book terminology"
   - "Refuse if insufficient grounding"

2. **Refusal Decision Tree**:
   - chunks.length == 0 → Refusal (FR-004)
   - top-1 score < 0.4 → Refusal (low relevance)
   - Requires multi-hop reasoning not in text → Refusal (FR-015)
   - Selected-text mode + answer not in selection → Refusal (FR-006)

3. **Post-Generation Validation**:
   - Citation completeness check
   - Term preservation check
   - Content containment check (embedding similarity)
   - Mode compliance check (selected-text-only)

4. **Fallback to Refusal**:
   - If any validation fails → Refusal (safer than hallucination)

**Data Flow Summary**:

**Standard RAG**:
```
QueryRequest → PlannedWorkflow(standard_rag) → QueryEmbedding → Qdrant search
→ List[RetrievedChunk] → GroundedAnswer(text + citations) → QueryResponse(success)
```

**Selected-Text**:
```
QueryRequest(+ selected_text) → PlannedWorkflow(selected_text_only)
→ List[RetrievedChunk] (single "chunk" = selected text)
→ GroundedAnswer (using only selected text) OR RefusalMessage → QueryResponse
```

**Refusal**:
```
QueryRequest → ... → List[RetrievedChunk] (empty OR low scores)
→ RefusalMessage(FR-004/FR-006) → QueryResponse(refused)
```

**Success Metrics Defined**:

From Spec Success Criteria (SC-001 through SC-007):
- SC-001: 100% grounding (manual review of 100 answers)
- SC-002: 100% citation completeness (automated check)
- SC-003: 100% refusal accuracy (20 out-of-scope questions)
- SC-004: 100% selected-text mode compliance (10 test queries)
- SC-005: 100% terminology preservation (manual review of 50 answers)
- SC-006: Multi-source citations present (8/10 multi-chapter questions)
- SC-007: Refusal latency < 1 second

**Additional Performance Metrics**:
- Latency: P95 < 3 seconds
- Throughput: 10 concurrent queries
- Availability: 99% uptime
- Cost: <$0.01 per query, <$20/month total

**Implementation Phases**:
- Phase 0: Environment setup (FastAPI, PostgreSQL, connectivity)
- Phase 1: Retriever agent (search_qdrant tool)
- Phase 2: Answer generator (grounded synthesis + validation)
- Phase 3: Planner & orchestration (FastAPI endpoint)
- Phase 4: Performance & observability (logging, caching, rate limiting)

**Risks & Mitigations**:
1. Hallucination → Post-generation validation + model upgrade path
2. Refusal over-sensitivity → Threshold calibration + borderline response
3. OpenRouter cost → Rate limiting + cheaper models + cost alerts
4. Selected-text usability → Clear UI messaging + expand search option
5. Qdrant free tier → Usage monitoring + upgrade path

## Outcome

- ✅ **Impact**: Complete implementation plan with agent orchestration, grounding strategy, data models, API contracts, and quickstart guide; all unknowns resolved; ready for task generation
- 🧪 **Tests**: Constitution check PASS (5/5 principles); 7 research questions resolved; 9 entities validated; OpenAPI spec complete; 5 risks documented with mitigations
- 📁 **Files**:
  - plan.md (architecture, phases, metrics, risks)
  - research.md (7 technical decisions with rationale)
  - data-model.md (9 entities + PostgreSQL schema)
  - contracts/api.openapi.yaml (complete OpenAPI 3.0 spec)
  - quickstart.md (installation, configuration, usage, troubleshooting, deployment)
- 🔁 **Next prompts**:
  1. Task generation: `/sp.tasks` (break down into atomic implementation tasks)
  2. Implementation: `/sp.implement` (execute tasks to build agents)
  3. ADR creation (optional): `/sp.adr "Agent Framework Selection"` (document OpenAI Agents SDK vs. LangChain decision)
- 🧠 **Reflection**: This plan balances strict grounding requirements (zero hallucination tolerance, mandatory refusals) with practical usability (upgrade paths, calibration). The 3-agent architecture (planner, retriever, answer generator) ensures clean boundaries: planner routes, retriever calls tools, answer generator never accesses tools (enforces grounding). Key insight: Post-generation validation is critical because LLM system prompts alone cannot guarantee zero hallucinations - the validation checks (citation, term preservation, content containment) provide a safety net, with fallback to refusal if validation fails. Selected-text mode implementation via tool conditional logic (vs. separate agents) keeps architecture simple while enforcing strict mode semantics. Research phase resolved all major unknowns (agent framework, LLM choice, citation format, refusal threshold, schema design, error handling) - no blocking issues identified. Cost analysis shows feasibility at $2-15/month for 1000 queries/month (free tier Qdrant + Neon, OpenRouter pay-per-use). Constitution check confirms alignment with educational mission: citations enforce accuracy, technical tone maintains clarity, production SDKs ensure reproducibility, zero hallucination policy upholds rigor, free tier infrastructure supports practicality/inclusivity.

## Evaluation notes (flywheel)

- **Failure modes observed**: None; all planning phases completed successfully with no blockers
- **Graders run and results (PASS/FAIL)**:
  - Constitution alignment - PASS (all 5 principles satisfied with explicit rationale)
  - Technical completeness - PASS (technology stack, agent architecture, data models, API contracts all defined)
  - Research depth - PASS (7 questions resolved with alternatives considered)
  - Risk analysis - PASS (5 risks with likelihood/impact/mitigation/detection)
  - Documentation quality - PASS (quickstart covers installation, usage, troubleshooting, testing, deployment)
- **Prompt variant (if applicable)**: User provided comprehensive planning requirements (agent orchestration, tool-based retrieval, book constraints, validation controls); expanded into full planning workflow (Phase 0 research, Phase 1 design, success metrics, risk analysis)
- **Next experiment (smallest change to try)**: For next planning phase, test whether including "decision matrices" (e.g., scoring agent frameworks on 5 criteria) improves decision documentation vs. narrative rationale alone. Also consider adding "failure mode analysis" (FMEA) for critical components (e.g., what happens if validation checks themselves have bugs?).
