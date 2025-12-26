# Research: Frontend ↔ Backend Integration

**Feature**: Frontend ↔ Backend Integration
**Date**: 2025-12-26
**Phase**: 0 (Research & Decisions)

## Research Questions

### 1. Backend API Contract

**Question**: What is the exact endpoint, request format, and response schema for the HF-hosted backend?

**Research Method**:
- Check Hugging Face Spaces URL: https://huggingface.co/spaces/shumailaaijaz/hackathon-book
- Review backend source code (if accessible)
- Test with curl to verify actual endpoint

**Findings**:

Based on user description and typical FastAPI patterns for RAG systems:

**Endpoint**: `/query` or `/` (POST)
**Request**: `{ "query": "user question text" }`
**Response**: `{ "answer": "grounded answer text", "citations": [...], "timestamp": epoch_seconds }`

**Citation Format** (from typical RAG systems):
```json
{
  "chapter": "Chapter 1: Introduction",
  "section": "1.2 Physical AI Definition",
  "source_url": "https://...",
  "referenced_text": "excerpt from textbook"
}
```

**Decision**: Assume `/query` endpoint with POST. Verify during implementation testing.

---

### 2. Error Response Format

**Question**: How does the backend signal errors vs. successful refusals (out-of-scope questions)?

**Research Method**:
- Test backend with invalid queries
- Check for standard FastAPI error format

**Findings**:

**HTTP Errors (4xx/5xx)**: Standard FastAPI format
```json
{
  "detail": "error message"
}
```

**Refusals** (200 OK with refusal message):
```json
{
  "answer": "The provided book content does not contain sufficient information to answer this question.",
  "citations": [],
  "timestamp": 1703620800
}
```

**Decision**: Treat refusals as successful responses (200 OK), display answer text to user even if it's a refusal message.

---

### 3. CORS Configuration

**Question**: Is CORS configured on the HF Spaces backend to allow localhost:3000?

**Research Method**:
- Check HF Spaces logs for CORS headers
- Test with browser fetch from localhost:3000

**Findings**:

**Assumption**: CORS must be pre-configured per spec constraints ("Assume backend CORS is correctly configured").

**CORS Headers Expected**:
```
Access-Control-Allow-Origin: *
(or specific origins including localhost:3000)
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**Decision**: Implement error handling for CORS failures, but assume CORS is working. If CORS fails, display clear error message: "Backend access blocked. Contact administrator."

---

### 4. Timeout Handling

**Question**: How to implement 30-second timeout with native fetch API?

**Research Method**:
- Review MDN docs for AbortController
- Test timeout with slow backend

**Findings**:

**Implementation Pattern**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch(url, {
    signal: controller.signal,
    ...
  });
} catch (error) {
  if (error.name === 'AbortError') {
    // Timeout occurred
  }
} finally {
  clearTimeout(timeoutId);
}
```

**Decision**: Use AbortController for timeout (standard browser API, no dependencies).

---

### 5. Environment Variable Best Practices

**Question**: How to handle NEXT_PUBLIC_API_URL with production defaults?

**Research Method**:
- Review Next.js environment variable documentation
- Check best practices for public/private env vars

**Findings**:

**Next.js Rule**: `NEXT_PUBLIC_*` variables are exposed to browser (required for client-side fetch)

**Best Practice**:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://huggingface.co/spaces/shumailaaijaz/hackathon-book';
```

**Security Note**: No sensitive data in NEXT_PUBLIC_ vars (they're in browser JS bundle)

**Decision**: Use NEXT_PUBLIC_API_URL with HF Spaces URL as fallback. Document in .env.example.

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API Client | Native fetch + AbortController | Zero dependencies, built-in timeout support |
| Endpoint | `/query` (POST) | Standard RAG endpoint pattern |
| Request Format | `{ query: string }` | Minimal required field |
| Response Format | `{ answer, citations[], timestamp }` | Matches RAG backend pattern |
| Timeout | 30s via AbortController | Spec requirement, native browser API |
| Error Handling | Granular (network/timeout/HTTP/validation) | User-friendly messages per error type |
| Environment Variable | NEXT_PUBLIC_API_URL with fallback | Next.js client-side requirement |
| Default Backend | HF Spaces URL | Production-first approach |
| CORS Handling | Assume configured, error if fails | Per spec constraints |
| Response Validation | Check answer & citations fields | Prevent UI crashes |

## Alternatives Considered

### API Client Libraries

**Rejected: axios**
- Reason: Unnecessary 13KB dependency for single endpoint
- Native fetch is sufficient

**Rejected: ky**
- Reason: Overkill for simple POST request
- AbortController provides timeout

### State Management

**Rejected: React Query / TanStack Query**
- Reason: No caching requirement in spec
- Manual retry only (no auto-retry)

**Rejected: SWR**
- Reason: Not needed for single API call
- Existing useState sufficient

### Error Handling

**Rejected: Global error boundary**
- Reason: Errors are request-specific, not app-wide
- Local error state in ChatContainer is clearer

## Research Artifacts

**Documentation Reviewed**:
1. Next.js Environment Variables: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables
2. MDN AbortController: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
3. Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

**Testing Required**:
1. Verify HF Spaces backend endpoint with curl/Postman
2. Test CORS from localhost:3000
3. Confirm citation format matches assumption
4. Test timeout behavior with slow backend

## Implementation Notes

**TypeScript**: Strict type checking for request/response (no `any` types)

**Error Messages**: User-friendly, non-technical
- ❌ "TypeError: Failed to fetch"
- ✅ "Unable to connect to server. Please try again."

**Loading State**: Show immediately on submit, hide on response/error

**Response Validation**: Check required fields exist before setState:
```typescript
if (!response.answer || !Array.isArray(response.citations)) {
  throw new Error('Invalid response format');
}
```

**Retry Logic**: Manual only (user clicks submit again after error)
