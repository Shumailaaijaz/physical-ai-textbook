# Physical AI RAG Chatbot API

FastAPI backend for querying the Physical AI textbook via RAG (Retrieval-Augmented Generation) system.

## Overview

This API server provides endpoints for the Docusaurus chatbot UI to query the Physical AI textbook using:
- **Vector Search**: Qdrant for semantic search across textbook content
- **Answer Generation**: OpenAI Agents SDK via OpenRouter for grounded answers
- **Citations**: Automatic extraction of chapter/section/URL references

## Architecture

```
Docusaurus UI (localhost:3000)
      ↓
FastAPI Backend (localhost:8000)
      ↓
   api.py → agent.py → Qdrant + OpenRouter
```

## Prerequisites

- Python 3.11+
- `uv` package manager (recommended) or `pip`
- API keys:
  - OpenRouter API key (or OpenAI API key)
  - Qdrant Cloud URL and API key
  - Cohere API key (for embeddings)

## Installation

### 1. Install Dependencies

**Using uv (recommended):**
```bash
cd src/chatbot/backend
uv sync
```

**Using pip:**
```bash
cd src/chatbot/backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp src/chatbot/backend/.env.example src/chatbot/backend/.env
```

Required environment variables:

```bash
# ============ OpenRouter (or OpenAI) ============
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-3.5-turbo

# OR use native OpenAI (comment out OpenRouter vars above)
# openai_api_key=your_openai_api_key_here

# ============ Qdrant Cloud ============
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# ============ Cohere Embeddings ============
COHERE_API_KEY=your_cohere_api_key_here

# ============ CORS (for local development) ============
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### 3. Verify Qdrant Ingestion

Ensure the Qdrant `rag_embeddings` collection is populated:

```bash
cd src/chatbot/backend
uv run python verify_ingestion.py
```

If the collection is empty, run the ingestion script:

```bash
uv run python main.py
```

## Running the Server

### Start the API Server

```bash
# From the website directory (D:\nativ-ai-web\website)
uv run uvicorn api:app --host 0.0.0.0 --port 8000
```

The server will start on **http://localhost:8000**

**Note**: Do not use `--reload` flag if you encounter event loop issues with the OpenAI Agents SDK.

### Verify Server is Running

```bash
# Health check
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "service": "Physical AI RAG Chatbot API",
  "version": "1.0.0",
  "environment_configured": true
}
```

## API Endpoints

### POST /chat

Query the Physical AI textbook via RAG system.

**Request:**
```json
{
  "query": "What is Physical AI?",
  "selected_text": "optional user-highlighted text",
  "session_id": "optional-session-id"
}
```

**Response (Grounded Answer):**
```json
{
  "text": "Physical AI refers to AI systems that interact with the physical world...",
  "citations": [
    {
      "chapter": "Chapter 1: Introduction to Physical AI",
      "section": "Learning Objectives",
      "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/docs/01-introduction-to-physical-ai",
      "referenced_text": "Physical AI systems perceive the physical world..."
    }
  ],
  "mode": "standard_rag"
}
```

**Response (Refusal):**
```json
{
  "reason": "The provided book content does not contain sufficient information to answer this question",
  "refusal_type": "low_relevance"
}
```

**Error Response:**
```json
{
  "detail": {
    "error": "Database connection error",
    "message": "Qdrant connection timeout. Check QDRANT_URL and network connectivity"
  }
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Physical AI?"}'
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "Physical AI RAG Chatbot API",
  "version": "1.0.0",
  "environment_configured": true
}
```

## Docusaurus Integration

To connect the existing Docusaurus chatbot UI to this backend:

### 1. Configure Docusaurus Environment

Create or update the Docusaurus `.env` file:

```bash
# In your Docusaurus project root
REACT_APP_API_URL=http://localhost:8000
```

### 2. Update Chatbot Component

Modify the Docusaurus chatbot component to use the API URL from environment variables:

```javascript
// In your chatbot component
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function sendQuery(query) {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data;
}
```

### 3. Start Both Servers

```bash
# Terminal 1: Start FastAPI backend
cd website
uv run uvicorn api:app --host 0.0.0.0 --port 8000

# Terminal 2: Start Docusaurus dev server
cd docusaurus-project
npm run start
```

Access the chatbot at: **http://localhost:3000**

## Error Handling

The API returns structured error responses for common failure scenarios:

| Status Code | Error Type | Description |
|-------------|-----------|-------------|
| 400 | Validation error | Invalid request (empty query, malformed JSON) |
| 500 | Database connection error | Qdrant connection failure |
| 500 | Backend processing error | OpenRouter API error or agent failure |
| 500 | Server configuration error | Missing environment variables |

## Testing

### Test Query Endpoint

```bash
# Valid query
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is ROS 2?"}'

# Query with selected text
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain this", "selected_text": "ROS 2 is the nervous system of modern robots"}'

# Out-of-scope query (should return refusal)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the meaning of life?"}'

# Invalid request (should return 400)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": ""}'
```

### View API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Troubleshooting

### Server Won't Start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:** Install dependencies using `uv sync` in the `src/chatbot/backend` directory.

---

**Error:** `AgentRunner.run_sync() cannot be called when an event loop is already running`

**Solution:** The `/chat` endpoint must be synchronous (`def` not `async def`). This has been fixed in the current implementation.

### CORS Errors

**Error:** `Access-Control-Allow-Origin` error in browser console

**Solution:** Ensure `ALLOWED_ORIGINS` in `.env` includes your Docusaurus dev server URL:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Qdrant Connection Issues

**Error:** `Qdrant connection timeout`

**Solutions:**
1. Check `QDRANT_URL` is correct
2. Verify `QDRANT_API_KEY` is valid
3. Ensure network connectivity to Qdrant Cloud

---

**Error:** `Collection 'rag_embeddings' not found`

**Solution:** Run the ingestion script:
```bash
cd src/chatbot/backend
uv run python main.py
```

### Empty Results

**Error:** All queries return refusal messages

**Solutions:**
1. Verify Qdrant collection has data: `uv run python verify_ingestion.py`
2. Check if queries are too generic or out-of-scope
3. Review similarity score threshold in `agent.py` (default: 0.4)

## Development

### File Structure

```
website/
├── api.py                     # FastAPI application (this file)
├── API_README.md              # This documentation
└── src/chatbot/backend/
    ├── agent.py               # RAG agent with OpenAI Agents SDK
    ├── retrieve.py            # Retrieval logic
    ├── main.py                # Ingestion script
    ├── requirements.txt       # Python dependencies
    ├── pyproject.toml         # Project configuration
    └── .env                   # Environment variables (create from .env.example)
```

### Making Changes

1. Edit `api.py` or `agent.py`
2. Restart the server (Ctrl+C then `uv run uvicorn api:app --host 0.0.0.0 --port 8000`)
3. Test changes using curl or the Swagger UI

### Adding New Endpoints

```python
@app.get("/your-endpoint")
def your_endpoint():
    """Endpoint description"""
    return {"message": "Hello World"}
```

## Production Deployment

### Environment Variables

Update `ALLOWED_ORIGINS` for your production domain:

```bash
ALLOWED_ORIGINS=https://your-production-domain.com,http://localhost:8000
```

### Deployment Options

**Option 1: Traditional server (PM2, systemd)**
```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

**Option 2: Docker**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r src/chatbot/backend/requirements.txt
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Option 3: Vercel, Railway, Render**
See platform-specific documentation for FastAPI deployment.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Qdrant collection status
3. Verify all environment variables are set correctly
4. Check API logs for detailed error messages

## License

See project LICENSE file.

---

**Last Updated**: 2025-12-26
**Author**: Claude Code
**Version**: 1.0.0
