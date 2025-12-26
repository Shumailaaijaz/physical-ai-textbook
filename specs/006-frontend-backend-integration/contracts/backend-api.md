# Backend API Contract

**Backend**: Hugging Face Spaces FastAPI RAG Backend
**Base URL (Production)**: `https://huggingface.co/spaces/shumailaaijaz/hackathon-book`
**Base URL (Local Development)**: `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`)

## Endpoint: Query RAG System

### POST `/query`

Submit a user query to the RAG system and receive a grounded answer with citations.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "query": "What is Physical AI?"
}
```

**Schema**:
```typescript
{
  query: string;  // Required, 1-1000 characters
}
```

**Example curl**:
```bash
curl -X POST https://huggingface.co/spaces/shumailaaijaz/hackathon-book/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Physical AI?"}'
```

#### Response (Success - 200 OK)

**Grounded Answer with Citations**:
```json
{
  "answer": "Physical AI refers to embodied artificial intelligence systems that interact with the physical world through robotics, sensors, and actuation. These systems combine perception, reasoning, and physical manipulation to perform tasks in real-world environments.",
  "citations": [
    {
      "chapter": "Chapter 1: Introduction to Physical AI",
      "section": "1.1 Defining Physical AI",
      "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/intro/physical-ai",
      "referenced_text": "Physical AI systems combine perception, reasoning, and actuation to interact with the physical world."
    },
    {
      "chapter": "Chapter 1: Introduction to Physical AI",
      "section": "1.2 Core Components",
      "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/intro/components",
      "referenced_text": "Sensors provide environmental data, reasoning engines process information, and actuators enable physical interaction."
    }
  ],
  "timestamp": 1703620800
}
```

**Schema**:
```typescript
{
  answer: string;              // Grounded answer text
  citations: Citation[];       // Attribution sources (may be empty for refusals)
  timestamp: number;           // Unix epoch seconds
}

interface Citation {
  chapter: string | null;           // e.g., "Chapter 3: Perception"
  section: string | null;           // e.g., "3.2 Computer Vision"
  source_url: string | null;        // Full URL to textbook page
  referenced_text: string | null;   // Excerpt from source
}
```

#### Response (Refusal - 200 OK)

When the question is out of scope or grounding is insufficient:

```json
{
  "answer": "The provided book content does not contain sufficient information to answer this question.",
  "citations": [],
  "timestamp": 1703620805
}
```

**Note**: Refusals return 200 OK (not error status codes). Frontend should display the refusal message as a normal response.

#### Response (Client Error - 400 Bad Request)

**Invalid Request**:
```json
{
  "detail": "Missing required field: query"
}
```

**Empty Query**:
```json
{
  "detail": "Query cannot be empty"
}
```

#### Response (Server Error - 500 Internal Server Error)

**Qdrant Connection Failure**:
```json
{
  "detail": "Vector database connection failed"
}
```

**OpenRouter API Error**:
```json
{
  "detail": "LLM service unavailable"
}
```

## Error Handling Strategy

### Frontend Error Mapping

| Backend Status | Frontend Handling | User Message |
|----------------|-------------------|--------------|
| 200 OK (success) | Display answer + citations | Show answer text |
| 200 OK (refusal) | Display refusal message | Show refusal text |
| 400 Bad Request | Display validation error | "Please check your question and try again." |
| 500 Internal Server Error | Display generic error | "Server error. Please try again later." |
| Network failure (no response) | Display network error | "Unable to connect to server. Please try again." |
| Timeout (>30s) | Display timeout error | "Request timed out. Please try again." |
| CORS error | Display CORS error | "Backend access blocked. Contact administrator." |

### Validation Rules

**Frontend (before API call)**:
- Query length: 1-1000 characters (already validated in `lib/validation.ts`)

**Backend (expected validations)**:
- Query field is required
- Query is non-empty string

**Frontend (after API response)**:
- Response must have `answer` field (non-empty string)
- Response must have `citations` field (array, can be empty)
- `timestamp` is optional (default to Date.now() if missing)

## Testing Examples

### Test 1: Valid Query

**Request**:
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is ROS 2?"}'
```

**Expected**: 200 OK with answer and citations

### Test 2: Out-of-Scope Query

**Request**:
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I train GPT models?"}'
```

**Expected**: 200 OK with refusal message, empty citations array

### Test 3: Empty Query

**Request**:
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": ""}'
```

**Expected**: 400 Bad Request (though frontend validation should prevent this)

### Test 4: Timeout Simulation

**Request**: Use slow backend or add artificial delay

**Expected**: Frontend timeout after 30s, "Request timed out" error

### Test 5: CORS Test

**Browser fetch from localhost:3000**:
```javascript
fetch('https://huggingface.co/spaces/shumailaaijaz/hackathon-book/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Test' })
})
```

**Expected**: Either successful response or CORS error (depends on backend config)

## Notes

**Endpoint Assumption**: This contract assumes `/query` endpoint. Actual HF Spaces endpoint may be `/` (root) or another path. Verify during implementation testing.

**CORS**: Backend must set `Access-Control-Allow-Origin` headers for frontend to work. If CORS fails, frontend will display error message.

**Timeout**: Frontend implements 30-second timeout using AbortController. Backend should respond faster, but frontend won't wait indefinitely.

**Citation Fields**: All citation fields are nullable. Frontend must handle missing data gracefully (e.g., display "Unknown Chapter" if `chapter` is null).

**Response Size**: No explicit limit, but frontend should handle large responses (e.g., 10,000 character answers) with scrollable UI.
