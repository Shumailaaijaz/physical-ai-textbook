# Quickstart Guide: RAG Answer Generation Agent

**Feature**: 004-answer-generation-agent
**Last Updated**: 2025-12-25

## Overview

This guide explains how to set up and run the RAG answer generation agent for the Physical AI textbook chatbot.

**Prerequisites**:
- ✅ Phase 0: Content Ingestion complete (rag_embeddings collection with 301 chunks in Qdrant)
- ✅ SPEC3: Retrieval validation passing (`retrieve.py` validates pipeline)
- ✅ Python 3.11+ with UV package manager installed
- ✅ OpenRouter API key (for LLM access)
- ✅ Neon PostgreSQL database provisioned

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Basic Usage](#basic-usage)
5. [Advanced Usage](#advanced-usage)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [Testing](#testing)

---

## Prerequisites

### Required Services

✅ **Qdrant Cloud** (existing, from Phase 0)
  - Collection: `rag_embeddings` with 301 chunks
  - Verify with: `cd src/chatbot/backend && uv run retrieve.py`

✅ **Cohere API** (existing, from Phase 0)
  - Model: `embed-multilingual-v3.0`
  - Already configured in `.env`

✅ **OpenRouter Account**
  - Sign up: https://openrouter.ai/
  - Get API key: https://openrouter.ai/keys
  - Models available: GPT-3.5-turbo, GPT-4, Claude 3 Sonnet, etc.

✅ **Neon PostgreSQL**
  - Sign up: https://neon.tech/
  - Create database (free tier: 512MB storage)
  - Get connection string

### System Requirements

- **Python**: 3.11 or higher
- **UV Package Manager**: Latest version (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Operating System**: Windows, macOS, or Linux

---

## Installation

### Step 1: Navigate to Backend Directory

```bash
cd src/chatbot/backend
```

### Step 2: Install Dependencies

The agent framework and FastAPI dependencies are new for this feature:

```bash
uv add fastapi openai httpx psycopg uvicorn
uv add --dev pytest-asyncio
```

**Dependencies installed**:
- `fastapi` - Web framework for API endpoint
- `openai` - OpenAI Agents SDK (works with OpenRouter)
- `httpx` - Async HTTP client
- `psycopg` - PostgreSQL driver
- `uvicorn` - ASGI server
- Existing: `cohere`, `qdrant-client`, `python-dotenv` (from Phase 0)

### Step 3: Verify Installation

```bash
uv pip list | grep -E "fastapi|openai|httpx|psycopg"
```

Expected output:
```
fastapi           0.109.0
httpx             0.26.0
openai            1.10.0
psycopg           3.1.0
uvicorn           0.27.0
```

---

## Configuration

### Step 1: Environment Variables

Create or update `src/chatbot/backend/.env`:

```bash
# Existing (from Phase 0)
COHERE_API_KEY=your-cohere-api-key
QDRANT_URL=https://your-qdrant-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key

# New (for RAG agent)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-3.5-turbo  # or anthropic/claude-3-sonnet
NEON_DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Optional
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com
RATE_LIMIT_PER_SESSION=10  # queries per minute
RATE_LIMIT_PER_IP=20  # queries per minute
```

### Step 2: Initialize PostgreSQL Schema

Run the schema initialization script:

```bash
uv run python -c "
from agents.database import init_database
init_database()
print('✅ PostgreSQL schema initialized')
"
```

Expected output:
```
✅ PostgreSQL schema initialized
Tables created: query_sessions, queries
```

### Step 3: Verify Connectivity

Test all external services:

```bash
uv run python -c "
from agents.health import check_health
health = check_health()
print(f'Qdrant: {health[\"qdrant\"]}')
print(f'OpenRouter: {health[\"openrouter\"]}')
print(f'PostgreSQL: {health[\"postgresql\"]}')
"
```

Expected output:
```
Qdrant: healthy
OpenRouter: healthy
PostgreSQL: healthy
```

---

## Basic Usage

### Step 1: Start the FastAPI Server

```bash
cd src/chatbot/backend
uv run uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 2: Test with a Query (Standard RAG Mode)

Open a new terminal and run:

```bash
curl -X POST http://localhost:8000/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How does ROS 2 work?",
    "top_k": 5
  }'
```

**Expected response** (success):
```json
{
  "status": "success",
  "answer": {
    "text": "ROS 2 is the nervous system of modern robots, connecting sensors, actuators, and AI into a unified organism. It provides a publish-subscribe messaging framework where nodes communicate via topics...",
    "citations": [
      {
        "chapter": "Chapter 2: ROS 2 Fundamentals",
        "section": "Learning Objectives",
        "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/docs/02-ros2-fundamentals",
        "referenced_text": "ROS 2 is the nervous system of modern robots"
      }
    ],
    "mode": "standard_rag"
  },
  "metadata": {
    "chunks_retrieved": 5,
    "processing_time_ms": 1234,
    "session_id": null,
    "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### Step 3: Test with Selected-Text-Only Mode

```bash
curl -X POST http://localhost:8000/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are topics?",
    "selected_text": "Nodes in ROS 2 communicate via topics, which are named channels for message passing."
  }'
```

**Expected response** (uses only selected text):
```json
{
  "status": "success",
  "answer": {
    "text": "Topics are named channels for message passing that enable nodes in ROS 2 to communicate.",
    "citations": [],
    "mode": "selected_text_only"
  },
  "metadata": {
    "chunks_retrieved": 1,
    "processing_time_ms": 567,
    "session_id": null,
    "request_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  }
}
```

### Step 4: Test Refusal Behavior

Ask a question outside book scope:

```bash
curl -X POST http://localhost:8000/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I train a GPT-4 model?"
  }'
```

**Expected response** (refusal):
```json
{
  "status": "refused",
  "refusal": {
    "reason": "The provided book content does not contain sufficient information to answer this question",
    "refusal_type": "empty_retrieval"
  },
  "metadata": {
    "chunks_retrieved": 0,
    "processing_time_ms": 234,
    "session_id": null,
    "request_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
  }
}
```

---

## Advanced Usage

### Using Sessions for Rate Limiting

Include a `session_id` to enable per-session tracking:

```bash
curl -X POST http://localhost:8000/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Physical AI?",
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

Sessions are tracked in PostgreSQL for:
- Rate limiting (10 queries/minute per session)
- Usage analytics
- Refusal pattern analysis

### Customizing Top-K Retrieval

Retrieve more chunks for comprehensive answers:

```bash
curl -X POST http://localhost:8000/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do robotic simulation tools work together?",
    "top_k": 10
  }'
```

**Trade-offs**:
- Higher `top_k` (10-20): More comprehensive answers, higher cost, slower
- Lower `top_k` (3-5): Faster, cheaper, may miss relevant context

### Switching LLM Models

Change the model via environment variable (requires server restart):

```bash
# Edit .env
OPENROUTER_MODEL=anthropic/claude-3-sonnet  # or openai/gpt-4

# Restart server
uv run uvicorn main:app --reload --port 8000
```

**Model Recommendations**:
- **GPT-3.5-turbo**: Fast, cheap ($0.002/1K tokens), good for most queries
- **Claude 3 Sonnet**: Better grounding ($0.003/1K tokens), recommended for educational content
- **GPT-4**: Highest accuracy ($0.03/1K tokens), use if hallucinations detected

### Health Check Endpoint

Monitor system health:

```bash
curl http://localhost:8000/health
```

**Expected response** (healthy):
```json
{
  "status": "healthy",
  "services": {
    "qdrant": "healthy",
    "openrouter": "healthy",
    "postgresql": "healthy"
  }
}
```

---

## API Reference

### POST /v1/query

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | User question (1-500 chars) |
| `selected_text` | string | No | Highlighted text (10-5000 chars) |
| `top_k` | integer | No | Chunks to retrieve (1-20, default=5) |
| `session_id` | UUID | No | Session identifier |

**Response** (status=success):
```json
{
  "status": "success",
  "answer": {
    "text": "...",
    "citations": [...],
    "mode": "standard_rag"
  },
  "metadata": { ... }
}
```

**Response** (status=refused):
```json
{
  "status": "refused",
  "refusal": {
    "reason": "...",
    "refusal_type": "empty_retrieval"
  },
  "metadata": { ... }
}
```

**Response** (status=error):
```json
{
  "status": "error",
  "error": {
    "code": "QDRANT_TIMEOUT",
    "message": "...",
    "details": "..."
  }
}
```

**Full OpenAPI Spec**: See `contracts/api.openapi.yaml`

---

## Troubleshooting

### Error 1: OpenRouter API Key Invalid

**Symptom**:
```json
{
  "status": "error",
  "error": {
    "code": "OPENROUTER_FAILURE",
    "message": "OpenRouter authentication failed"
  }
}
```

**Solution**:
1. Verify API key: https://openrouter.ai/keys
2. Check `.env` file: `OPENROUTER_API_KEY=sk-or-v1-...`
3. Restart server after updating `.env`

---

### Error 2: PostgreSQL Connection Failed

**Symptom**:
```
ERROR: could not connect to PostgreSQL database
```

**Solution**:
1. Verify Neon database is active: https://console.neon.tech/
2. Check connection string format:
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
3. Test connection:
   ```bash
   psql "postgresql://user:password@host.neon.tech/dbname?sslmode=require"
   ```

---

### Error 3: Rate Limit Exceeded

**Symptom**:
```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait before trying again.",
    "retry_after": 60
  }
}
```

**Solution**:
- Wait `retry_after` seconds before retrying
- Use different `session_id` if testing (10 queries/min per session)
- Increase rate limits in `.env`:
  ```
  RATE_LIMIT_PER_SESSION=20
  RATE_LIMIT_PER_IP=40
  ```

---

### Error 4: Hallucination Detected (Validation Failure)

**Symptom**:
```json
{
  "status": "refused",
  "refusal": {
    "reason": "The provided book content does not contain sufficient information to answer this question",
    "refusal_type": "insufficient_grounding"
  }
}
```

**Cause**: Post-generation validation detected potential hallucination

**Solution**:
- This is correct behavior (better to refuse than hallucinate)
- If too many false refusals, upgrade to Claude 3 Sonnet:
  ```
  OPENROUTER_MODEL=anthropic/claude-3-sonnet
  ```

---

### Error 5: Qdrant Timeout

**Symptom**:
```json
{
  "status": "error",
  "error": {
    "code": "QDRANT_TIMEOUT",
    "message": "The search service is temporarily unavailable. Please try again.",
    "details": "Qdrant connection timeout after 5s"
  }
}
```

**Solution**:
1. Check Qdrant Cloud status: https://cloud.qdrant.io/
2. Verify `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
3. Test with `retrieve.py`:
   ```bash
   cd src/chatbot/backend
   uv run retrieve.py
   ```

---

## Testing

### Unit Tests

Run the test suite:

```bash
cd src/chatbot/backend
uv run pytest tests/ -v
```

**Test Coverage**:
- Retriever agent: Standard RAG mode, selected-text mode
- Answer generator: Grounding checks, refusal logic, citation extraction
- Planner agent: Workflow routing
- Validation checks: Term preservation, content containment

### Integration Tests

Test end-to-end workflow:

```bash
uv run pytest tests/integration/test_e2e.py -v
```

**Scenarios**:
- Standard RAG happy path (question → answer + citations)
- Selected-text mode (ignore non-selected chunks)
- Refusal (empty results, low relevance)
- Error handling (Qdrant timeout, OpenRouter failure)

### Manual Testing Checklist

✅ **Standard RAG**:
- [ ] In-scope question returns answer with ≥1 citation
- [ ] Multi-chapter question cites all relevant sources
- [ ] Answer uses exact book terminology (no synonym substitution)

✅ **Selected-Text Mode**:
- [ ] Answer uses ONLY selected text (ignores other chunks)
- [ ] Refusal if answer not in selected text

✅ **Refusal Cases**:
- [ ] Out-of-scope question refused (e.g., "How do I train GPT-4?")
- [ ] Empty retrieval results refused
- [ ] Low-relevance chunks refused

✅ **Performance**:
- [ ] P95 latency < 3 seconds
- [ ] System handles 10 concurrent queries

---

## Production Deployment

### Step 1: Deploy to Cloud Platform

**Recommended**: Fly.io or Render

**Fly.io Example**:
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
cd src/chatbot/backend
fly launch
fly deploy
```

### Step 2: Set Environment Variables

```bash
fly secrets set COHERE_API_KEY=...
fly secrets set QDRANT_URL=...
fly secrets set QDRANT_API_KEY=...
fly secrets set OPENROUTER_API_KEY=...
fly secrets set NEON_DATABASE_URL=...
```

### Step 3: Enable HTTPS

Fly.io and Render provide free HTTPS certificates automatically.

### Step 4: Monitor Costs

**OpenRouter Cost Tracking**:
```bash
# View usage dashboard
open https://openrouter.ai/activity
```

**Estimated Monthly Cost** (1000 queries/month):
- OpenRouter (GPT-3.5-turbo): ~$2-5
- Qdrant Cloud: $0 (free tier)
- Neon PostgreSQL: $0 (free tier)
- Fly.io/Render: $0-10 (free tier or hobby plan)

**Total**: $2-15/month

---

## Best Practices

### 1. Start with Cheaper Models

Use GPT-3.5-turbo initially, upgrade if quality issues:
```
OPENROUTER_MODEL=openai/gpt-3.5-turbo  # $0.002/1K tokens
```

Upgrade path:
```
OPENROUTER_MODEL=anthropic/claude-3-sonnet  # $0.003/1K tokens
OPENROUTER_MODEL=openai/gpt-4  # $0.03/1K tokens (if necessary)
```

### 2. Monitor Refusal Rate

Log all refusals and review weekly:
```sql
SELECT refusal_type, COUNT(*)
FROM queries
WHERE status = 'refused'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY refusal_type;
```

**Target**: <20% refusal rate (adjust thresholds if higher)

### 3. Implement Caching

Cache query embeddings for repeated questions:
- TTL: 1 hour
- Reduce Cohere API costs by 30-50%

### 4. Rate Limit Aggressively

Default limits (adjust based on usage):
```
RATE_LIMIT_PER_SESSION=10  # per minute
RATE_LIMIT_PER_IP=20  # per minute
```

### 5. Review Hallucination Logs

Manually review first 100 answers for hallucinations:
```sql
SELECT query_text, status
FROM queries
WHERE status = 'success'
ORDER BY created_at
LIMIT 100;
```

If >5% hallucinations detected, switch to Claude 3 Sonnet.

---

## Next Steps

After successful deployment:

1. **Integrate Frontend**: Connect web UI to `/v1/query` endpoint
2. **Enable Analytics**: Track citation popularity, common questions, refusal patterns
3. **A/B Test Models**: Compare GPT-3.5-turbo vs. Claude 3 Sonnet answer quality
4. **Add Multi-Turn Memory** (future): Enable conversation context (out of scope for Phase 1)
5. **Implement Feedback Loop**: Allow users to rate answer quality

---

## Additional Resources

- **OpenAPI Spec**: `contracts/api.openapi.yaml`
- **Data Model**: `data-model.md`
- **Implementation Plan**: `plan.md`
- **Research Decisions**: `research.md`

**Support**: Open an issue at https://github.com/your-repo/issues

---

**Last Updated**: 2025-12-25
**Version**: 1.0
**Status**: Ready for implementation
