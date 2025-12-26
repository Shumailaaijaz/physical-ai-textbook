# Research: RAG Answer Generation Agent

**Feature**: 004-answer-generation-agent
**Created**: 2025-12-25
**Purpose**: Resolve technical unknowns and document decision rationale

## Research Questions

### R1: Agent Framework Selection (OpenAI Agents SDK vs. LangChain vs. Custom)

**Question**: Which agent framework best supports multi-agent orchestration with tool-based retrieval and strict grounding constraints?

**Options Evaluated**:

1. **OpenAI Agents SDK** (via ChatKit integration)
   - Pros: Native tool calling, built-in agent orchestration, OpenRouter compatibility
   - Cons: Newer framework, less community resources than LangChain

2. **LangChain Agents**
   - Pros: Mature ecosystem, extensive documentation, many built-in tools
   - Cons: Heavy framework, harder to enforce strict constraints, potential for over-engineering

3. **Custom Agent Implementation**
   - Pros: Full control, minimal dependencies, exact grounding enforcement
   - Cons: More development effort, need to implement tool calling, agent handoff logic

**Decision**: **OpenAI Agents SDK (via OpenRouter)**

**Rationale**:
- OpenRouter provides OpenAI-compatible API, enabling use of OpenAI Agents SDK with flexible model selection (GPT-4, Claude, etc.)
- Native tool calling support aligns with tool-based architecture (search_qdrant tool)
- Agent-to-agent handoff is first-class concept (planner → retriever → answer generator)
- Lighter weight than LangChain, easier to enforce strict grounding constraints
- Custom implementation would require significant effort for marginal control benefits

**Alternatives Considered**: LangChain (too heavy for strict grounding requirements), Custom (too much reinvention)

---

### R2: LLM Selection for Answer Generation

**Question**: Which LLM model best balances grounding accuracy, cost, and latency for educational content generation?

**Options Evaluated**:

1. **GPT-4** (via OpenRouter)
   - Pros: Highest accuracy, best instruction following, strong grounding
   - Cons: Expensive ($0.03/1K tokens), slower latency (~2-3s)

2. **GPT-3.5-turbo** (via OpenRouter)
   - Pros: Fast (~1s latency), cheap ($0.002/1K tokens), decent accuracy
   - Cons: More prone to hallucination, weaker instruction following

3. **Claude 3 Opus** (via OpenRouter)
   - Pros: Strong grounding, excellent citation generation, academic writing quality
   - Cons: Expensive ($0.015/1K tokens), slower

4. **Claude 3 Sonnet** (via OpenRouter)
   - Pros: Good balance of accuracy and cost ($0.003/1K tokens), faster than Opus
   - Cons: Slightly lower accuracy than Opus

**Decision**: **Start with GPT-3.5-turbo, upgrade to Claude 3 Sonnet if hallucinations detected**

**Rationale**:
- **Phase 1 deployment**: GPT-3.5-turbo for cost efficiency ($0.002/1K tokens)
  - Budget: 1000 queries/month = ~$2-5/month
  - Acceptable for MVP testing
  - Post-generation validation checks catch hallucinations
- **Phase 2 upgrade path**: If manual review detects >5% hallucination rate, switch to Claude 3 Sonnet
  - Better grounding for educational content
  - Still cost-effective ($0.003/1K tokens = 50% more expensive but <3x cheaper than GPT-4)
- **Fallback**: GPT-4 only if Claude 3 Sonnet fails grounding tests (high cost justified by accuracy)

**Configuration**: Model selection via environment variable `OPENROUTER_MODEL` (default: `openai/gpt-3.5-turbo`)

**Alternatives Considered**: GPT-4 (too expensive for MVP), Claude 3 Opus (overkill for most queries)

---

### R3: Citation Format Strategy

**Question**: How should citations be structured and presented in answers?

**Options Evaluated**:

1. **Inline Citations** (e.g., "ROS 2 is a framework [1] for robotics...")
   - Pros: Academic standard, clear claim-to-source mapping
   - Cons: Cluttered reading experience, requires footnote rendering

2. **Parenthetical Citations** (e.g., "ROS 2 is a framework (Chapter 2, Section 2.1)...")
   - Pros: Readable, immediate source attribution
   - Cons: Can interrupt flow, verbose for multi-source answers

3. **End-of-Answer Citations** (Answer text + separate citations array)
   - Pros: Clean reading, structured data for frontend rendering
   - Cons: Less clear which claim maps to which source

4. **Hybrid** (Inline + End-of-Answer)
   - Pros: Best traceability, frontend can choose rendering
   - Cons: Redundant data, more complex

**Decision**: **End-of-Answer Citations with Claim Mapping (Structured JSON)**

**Format**:
```json
{
  "answer": {
    "text": "ROS 2 is the nervous system of modern robots, connecting sensors, actuators, and AI. It provides a publish-subscribe messaging framework.",
    "citations": [
      {
        "chapter": "Chapter 2: ROS 2 Fundamentals",
        "section": "Learning Objectives",
        "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/docs/02-ros2-fundamentals",
        "referenced_text": "ROS 2 is the nervous system of modern robots"
      }
    ]
  }
}
```

**Rationale**:
- Frontend flexibility: Web UI can render citations as footnotes, inline links, or sidebar
- Structured data enables citation analytics (which chapters most cited)
- Cleaner reading experience (no interruption of flow)
- `referenced_text` field provides claim-to-source mapping for validation

**Alternatives Considered**: Inline (too cluttered), Parenthetical (verbose for multi-source)

---

### R4: Refusal Threshold Calibration

**Question**: What relevance score threshold should trigger refusal (vs. attempting answer generation)?

**Approach**: Empirical calibration using Phase 0 ingestion data

**Hypothesis**: Top-1 score < 0.4 indicates insufficient grounding

**Testing Plan**:
1. Run 20 test queries across spectrum (in-scope, borderline, out-of-scope)
2. Measure top-1 similarity scores:
   - In-scope (e.g., "What is ROS 2?"): Expected score >0.6
   - Borderline (e.g., "How does ROS 2 compare to ROS 1?"): Expected score 0.4-0.6
   - Out-of-scope (e.g., "How do I train GPT-4?"): Expected score <0.3
3. Analyze false positive/negative rates at different thresholds

**Baseline Decision**: **Threshold = 0.4 (top-1 score)**

**Rationale**:
- If top-1 chunk has score <0.4, high likelihood of poor grounding
- Conservative threshold (prefer refusal over hallucination)
- Can be adjusted based on production refusal rate monitoring

**Fallback Logic**:
```python
if len(chunks) == 0:
    return REFUSAL  # FR-004 message
elif chunks[0].score < 0.4:
    # Check if question is actually answerable with lower-relevance chunks
    if requires_multi_hop_reasoning(query, chunks):
        return REFUSAL  # FR-015 message
    else:
        # Attempt answer with explicit disclaimer
        return ATTEMPT_WITH_WARNING
else:
    return GENERATE_ANSWER
```

**Monitoring**: Log all borderline cases (score 0.35-0.45) for manual review to calibrate threshold

**Alternatives Considered**: 0.3 (too permissive, more hallucination risk), 0.5 (too strict, high refusal rate)

---

### R5: Selected-Text Mode Implementation

**Question**: How to technically enforce selected-text-only constraint when retriever agent has access to Qdrant?

**Challenge**: Retriever agent has `search_qdrant` tool - how to prevent it from querying Qdrant in selected-text mode?

**Options Evaluated**:

1. **Tool Conditional Logic** (Retriever checks mode, bypasses Qdrant if selected_text present)
   - Pros: Single retriever agent, clean separation of concerns
   - Cons: Retriever has dual behavior (tool-based vs. passthrough)

2. **Separate Agents** (Two retriever agents: StandardRetriever, SelectedTextRetriever)
   - Pros: Clear single responsibility, no conditional logic
   - Cons: Code duplication, more agents to maintain

3. **Planner Bypasses Retriever** (Planner directly passes selected_text to Answer Generator)
   - Pros: Simplest, no retriever involvement
   - Cons: Violates agent orchestration pattern (planner should route, not process)

**Decision**: **Option 1 - Tool Conditional Logic in Retriever Agent**

**Implementation**:
```python
# tools/search_qdrant.py
def search_qdrant(query: str, top_k: int, selected_text: str | None) -> List[RetrievedChunk]:
    if selected_text is not None:
        # Selected-text mode: Return selected text as single "chunk"
        return [RetrievedChunk(
            chunk_id="selected_text",
            text=selected_text,
            chapter=None,  # No metadata for selected text
            section=None,
            source_url=None,
            similarity_score=1.0  # Perfect "relevance" (user selected it)
        )]

    # Standard mode: Generate embedding and query Qdrant
    embedding = generate_embedding(query)
    results = qdrant_client.query_points(collection_name="rag_embeddings", query=embedding, limit=top_k)
    return parse_results(results)
```

**Rationale**:
- Single retriever agent maintains simplicity
- Conditional logic is explicit and testable
- Planner remains pure routing (no data transformation)
- Answer Generator receives uniform input format (List[RetrievedChunk]) regardless of mode

**Validation**: Unit test verifies selected_text mode returns ONLY selected text chunk, never calls Qdrant

**Alternatives Considered**: Separate agents (too much duplication), Planner bypass (breaks orchestration pattern)

---

### R6: PostgreSQL Session Schema Design

**Question**: What metadata should be stored in PostgreSQL (vs. what stays ephemeral)?

**Requirements**:
- Track usage patterns for cost monitoring
- Identify common refusals for improvement
- Enable rate limiting per session/IP
- **NOT** store conversation history (stateless design)
- **NOT** store book content (already in Qdrant)
- **NOT** store answers (privacy, no retention needed)

**Schema Design**:

```sql
-- Session tracking (for rate limiting)
CREATE TABLE query_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  user_ip VARCHAR(45),  -- IPv4/IPv6 for rate limiting
  query_count INTEGER DEFAULT 0,
  last_query_at TIMESTAMP
);

CREATE INDEX idx_sessions_ip_created ON query_sessions(user_ip, created_at);

-- Query metadata (for analytics, no answer storage)
CREATE TABLE queries (
  query_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES query_sessions(session_id),
  query_text TEXT NOT NULL,  -- Store query for refusal analysis
  selected_text_length INTEGER,  -- Length only (not content, for privacy)
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('standard_rag', 'selected_text_only')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'refused', 'error')),
  refusal_reason TEXT,  -- Only if status='refused'
  chunks_retrieved INTEGER,
  top_chunk_score FLOAT,  -- For calibration analysis
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_queries_status ON queries(status, created_at);
CREATE INDEX idx_queries_session ON queries(session_id);

-- No storage of:
-- - Answer text (ephemeral, not needed for analytics)
-- - Retrieved chunks (already in Qdrant)
-- - Citations (derived from chunks, ephemeral)
```

**Rationale**:
- **Minimal data storage**: Only what's needed for monitoring and rate limiting
- **Privacy-preserving**: No answer storage, selected_text length only (not content)
- **Analytics-focused**: Track refusal patterns, score distributions for threshold calibration
- **Rate limiting support**: session_id and user_ip enable per-session and per-IP limits

**Retention Policy**: Queries older than 90 days automatically deleted (GDPR compliance, minimize storage)

**Alternatives Considered**: Store full answers (unnecessary + privacy concerns), Store chunks (redundant with Qdrant)

---

### R7: Error Handling Strategy

**Question**: How should the system handle failures in the agent orchestration pipeline?

**Failure Modes**:

1. **Qdrant Timeout** (Retriever agent can't reach vector DB)
   - Response: Return error status with retry suggestion
   - User message: "The search service is temporarily unavailable. Please try again."
   - HTTP status: 503 Service Unavailable

2. **Cohere API Failure** (Embedding generation fails)
   - Response: Return error status with retry suggestion
   - User message: "Unable to process your query. Please try again."
   - HTTP status: 503 Service Unavailable

3. **OpenRouter Timeout** (LLM takes >30s)
   - Response: Return error after timeout
   - User message: "Answer generation took too long. Please simplify your question or try again."
   - HTTP status: 504 Gateway Timeout

4. **Validation Failure** (Post-generation checks detect hallucination)
   - Response: Fallback to refusal (better to refuse than hallucinate)
   - User message: "The provided book content does not contain sufficient information to answer this question"
   - HTTP status: 200 OK (not a system error, valid refusal)

5. **Rate Limit Exceeded**
   - Response: Return rate limit error
   - User message: "Too many requests. Please wait before trying again."
   - HTTP status: 429 Too Many Requests

**Error Response Format**:
```json
{
  "status": "error",
  "error": {
    "code": "QDRANT_TIMEOUT",
    "message": "The search service is temporarily unavailable. Please try again.",
    "details": "Qdrant connection timeout after 5s",
    "retry_after": 60  // seconds (for rate limiting)
  },
  "metadata": {
    "timestamp": "2025-12-25T10:30:00Z",
    "request_id": "uuid-v4"
  }
}
```

**Retry Logic**:
- Qdrant: 1 retry with 2s delay (same as retrieve.py)
- Cohere: 2 retries with exponential backoff (transient API failures)
- OpenRouter: No retries (expensive, timeout indicates need for simplification)

**Logging**:
- All errors logged with full context (request_id, session_id, error details)
- Structured logging (JSON format) for easy parsing
- Critical errors (OpenRouter failures) trigger alerts

**Rationale**: Fail gracefully with actionable user messages, distinguish transient failures (retry) from permanent failures (refusal)

**Alternatives Considered**: Generic error messages (less helpful), Always retry (wastes resources for permanent failures)

---

## Research Summary

**All technical unknowns resolved**. Key decisions:

1. **Agent Framework**: OpenAI Agents SDK (via OpenRouter)
2. **LLM Model**: GPT-3.5-turbo (upgrade to Claude 3 Sonnet if needed)
3. **Citation Format**: Structured JSON with end-of-answer citations
4. **Refusal Threshold**: Top-1 score < 0.4
5. **Selected-Text Mode**: Tool conditional logic in retriever
6. **Session Storage**: Minimal metadata only (no answers, no chunks)
7. **Error Handling**: Graceful failures with actionable messages

**No blockers identified**. Implementation can proceed to Phase 1 (data modeling and contracts).
