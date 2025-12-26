# Implementation Plan: Production RAG Chatbot Integration (HF Backend + Frontend)

**Branch**: `main` | **Date**: 2025-12-26 | **Spec**: [Backend-Frontend Integration Spec](../005-backend-frontend-integration/spec.md)
**Input**: Feature specification from `/specs/005-backend-frontend-integration/spec.md` + Production deployment requirements

## Summary

Finalize a production-ready RAG chatbot by stabilizing the Hugging Face Space backend, creating a frontend UI from scratch, and connecting the frontend to the HF-hosted backend. The system enables users to query the Physical AI textbook via a web interface, receiving grounded answers with citations while maintaining strict RAG integrity.

**Execution Order**:
1. HF Backend Production Readiness (stabilize existing FastAPI deployment)
2. Frontend Creation (new React/Next.js UI)
3. Frontend ↔ HF Backend Integration (CORS, API contract, deployment)

## Technical Context

**Language/Version**: Python 3.11 (backend), Node.js 18+ with TypeScript 5.0+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI 0.104+, openai-agents 0.6+, qdrant-client 1.8+, cohere 5.0+, uvicorn
- Frontend: React 18+, Next.js 14+, Tailwind CSS 3.3+, Axios/Fetch API

**Storage**:
- Qdrant (vector database - read-only, already populated)
- Neon PostgreSQL (session metadata - deferred for v1.0)

**Testing**:
- Backend: pytest, pytest-asyncio
- Frontend: Jest, React Testing Library, Cypress (E2E)

**Target Platform**:
- Backend: Hugging Face Spaces (Docker container, public deployment)
- Frontend: Vercel/Netlify (static deployment) or Next.js Edge deployment

**Project Type**: Web application (separated frontend + backend)

**Performance Goals**:
- 95% of queries return within 5 seconds
- Support 10+ concurrent users without degradation
- Health check responds within 1 second

**Constraints**:
- HF Space backend URL is public and immutable: `https://huggingface.co/spaces/shumailaaijaz/hackathon-book`
- CORS must allow frontend origin while maintaining security
- No authentication in v1.0 (public access)
- Frontend must handle HF Space cold starts (first request may take 30+ seconds)

**Scale/Scope**:
- Initial deployment: 100-500 users/day expected
- Query volume: 50-200 queries/day
- Single-region deployment (HF default region)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Accuracy through Primary Source Verification
- ✅ **PASS**: Backend already implements strict grounding with citations (SPEC3)
- ✅ **PASS**: All refusals propagate verbatim to frontend (no hallucination)
- ⚠️ **MONITOR**: Frontend must display citations prominently (not buried in UI)

### Clarity for Academic & Practitioner Audience
- ✅ **PASS**: API contract uses standard REST patterns with clear error messages
- ✅ **PASS**: Frontend UI targets academic users (students, researchers)

### Reproducibility
- ⚠️ **ACTION REQUIRED**: Document HF Space configuration (Dockerfile, environment variables)
- ⚠️ **ACTION REQUIRED**: Frontend deployment instructions must be explicit
- ✅ **PASS**: All dependencies version-locked in requirements.txt and package.json

### Rigor
- ✅ **PASS**: Backend uses established RAG pipeline (SPEC2, SPEC3)
- ✅ **PASS**: Frontend follows industry-standard React/Next.js patterns

### Practicality & Inclusivity
- ✅ **PASS**: Public deployment accessible without authentication
- ⚠️ **FUTURE**: Urdu language support deferred to v2.0 (frontend UI only in English for v1.0)

**Gate Status**: ✅ **APPROVED** - Minor monitoring items noted, no blocking violations

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (HF deployment, frontend frameworks, CORS)
├── data-model.md        # Phase 1 output (API request/response entities)
├── quickstart.md        # Phase 1 output (deployment guide)
├── contracts/           # Phase 1 output (OpenAPI spec for /health and /chat)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/                 # Existing backend code (src/chatbot/backend/)
├── agent.py            # Answer generation agent (SPEC3)
├── retrieve.py         # Retriever agent (SPEC2)
├── main.py             # FastAPI application entry point
├── requirements.txt    # Python dependencies
├── pyproject.toml      # Project metadata
├── .env.example        # Environment variable template
└── tests/              # Backend tests

frontend/               # NEW - Frontend application
├── src/
│   ├── components/     # React components (ChatInterface, AnswerDisplay, CitationList)
│   ├── pages/          # Next.js pages (index.tsx, chat.tsx)
│   ├── services/       # API client (chatApi.ts, healthApi.ts)
│   ├── types/          # TypeScript types (ChatRequest, ChatResponse, etc.)
│   └── styles/         # Tailwind CSS styles
├── public/             # Static assets
├── tests/              # Frontend tests
├── package.json        # Node dependencies
├── tsconfig.json       # TypeScript configuration
├── next.config.js      # Next.js configuration
└── .env.example        # Environment variable template

.huggingface/           # NEW - HF Space configuration
├── Dockerfile          # Container definition
├── app.py              # Gradio wrapper (optional, if needed for HF interface)
└── README.md           # HF Space documentation
```

**Structure Decision**: Web application structure (Option 2) selected because the feature requires separated frontend and backend. Backend already exists at `src/chatbot/backend/` and will be moved/symlinked to `backend/` for clarity. Frontend is net-new and will be created at `frontend/` root.

## Complexity Tracking

> **No violations identified** - All constitution checks pass or have minor monitoring items that don't require justification.

## Phase 0: Research & Discovery

**Objective**: Resolve all technical unknowns before design phase

### Research Tasks

1. **Hugging Face Spaces Production Configuration**
   - Task: Document current HF Space setup for `shumailaaijaz/hackathon-book`
   - Questions to answer:
     - What is the current Dockerfile configuration?
     - How are environment variables managed in HF Spaces?
     - What is the cold start behavior and mitigation strategies?
     - How to configure CORS in HF Spaces (environment vars vs code)?
   - Output: `research.md` section on HF deployment best practices

2. **Frontend Framework Selection**
   - Task: Confirm Next.js 14 App Router as frontend framework
   - Questions to answer:
     - App Router vs Pages Router for this use case?
     - Static export vs Edge runtime deployment?
     - Tailwind CSS integration patterns?
   - Output: `research.md` section on frontend architecture decisions

3. **CORS Configuration Strategy**
   - Task: Research production CORS setup for HF backend + Vercel/Netlify frontend
   - Questions to answer:
     - How to configure allowed origins dynamically?
     - Preflight request handling in FastAPI?
     - Security considerations for public API?
   - Output: `research.md` section on CORS implementation

4. **Error Handling & Loading States**
   - Task: Research UX patterns for RAG query loading (5-30 second waits)
   - Questions to answer:
     - Progressive loading indicators?
     - Timeout handling for HF cold starts?
     - Error message display patterns?
   - Output: `research.md` section on frontend UX patterns

5. **Citation Display Patterns**
   - Task: Research best practices for displaying academic citations in chat UI
   - Questions to answer:
     - Inline citations vs side panel?
     - Expandable/collapsible citation details?
     - Link handling for source URLs?
   - Output: `research.md` section on citation UI patterns

**Deliverable**: `specs/main/research.md` with all research findings and decisions documented

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete, all NEEDS CLARIFICATION resolved

### 1.1 Data Model Design

**Input**: Key Entities from spec (ChatRequest, ChatResponse, RefusalResponse, ErrorResponse, HealthStatus)

**Output**: `specs/main/data-model.md` containing:

**ChatRequest Entity**
```typescript
interface ChatRequest {
  query: string;              // User's question (required, max 1000 chars)
  selected_text?: string;     // Optional highlighted text for context
  session_id?: string;        // Optional session identifier for conversation history
}
```

**ChatResponse Entity (Success)**
```typescript
interface Citation {
  chapter: string | null;
  section: string | null;
  source_url: string | null;
  referenced_text: string | null;
}

interface ChatResponse {
  status: 'success';
  answer: string;             // Grounded answer text
  citations: Citation[];      // Array of source citations
  mode: 'standard_rag' | 'selected_text_only';
  session_id?: string;        // Echoed back for session tracking
}
```

**RefusalResponse Entity**
```typescript
interface RefusalResponse {
  status: 'refusal';
  reason: string;             // Human-readable refusal message
  refusal_type: 'empty_retrieval' | 'low_relevance' | 'insufficient_grounding' | 'selected_text_missing';
}
```

**ErrorResponse Entity**
```typescript
interface ErrorResponse {
  status: 'error';
  error_message: string;      // User-friendly error description
  error_type: 'validation' | 'timeout' | 'server_error' | 'network_error';
  status_code: number;        // HTTP status code
  validation_details?: {      // Optional, for validation errors
    field: string;
    issue: string;
  }[];
}
```

**HealthStatus Entity**
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  qdrant_connected: boolean;
  agent_available: boolean;
  timestamp: string;          // ISO 8601 timestamp
}
```

**Validation Rules**:
- `query` must be non-empty and ≤1000 characters
- `selected_text` if provided must be ≤5000 characters
- `session_id` if provided must match format `[a-zA-Z0-9-_]{8,64}`

**State Transitions**:
- User submits query → Loading state → Success/Refusal/Error state
- Health check: Unknown → Checking → Healthy/Degraded/Unhealthy

### 1.2 API Contracts

**Output**: `specs/main/contracts/openapi.yaml` (OpenAPI 3.1 specification)

**Endpoints**:

```yaml
openapi: 3.1.0
info:
  title: Physical AI RAG Chatbot API
  version: 1.0.0
  description: Backend API for querying Physical AI textbook via RAG system

servers:
  - url: https://shumailaaijaz-hackathon-book.hf.space
    description: Production HF Space deployment

paths:
  /health:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: Backend is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthStatus'

  /chat:
    post:
      summary: Submit query to RAG system
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
      responses:
        '200':
          description: Successfully processed query (success or refusal)
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/ChatResponse'
                  - $ref: '#/components/schemas/RefusalResponse'
        '400':
          description: Invalid request (validation error)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    ChatRequest:
      type: object
      required: [query]
      properties:
        query:
          type: string
          maxLength: 1000
          example: "What is Physical AI?"
        selected_text:
          type: string
          maxLength: 5000
        session_id:
          type: string
          pattern: '^[a-zA-Z0-9-_]{8,64}$'

    ChatResponse:
      type: object
      properties:
        status:
          type: string
          enum: [success]
        answer:
          type: string
        citations:
          type: array
          items:
            $ref: '#/components/schemas/Citation'
        mode:
          type: string
          enum: [standard_rag, selected_text_only]
        session_id:
          type: string

    Citation:
      type: object
      properties:
        chapter:
          type: string
          nullable: true
        section:
          type: string
          nullable: true
        source_url:
          type: string
          nullable: true
        referenced_text:
          type: string
          nullable: true

    RefusalResponse:
      type: object
      properties:
        status:
          type: string
          enum: [refusal]
        reason:
          type: string
        refusal_type:
          type: string
          enum: [empty_retrieval, low_relevance, insufficient_grounding, selected_text_missing]

    ErrorResponse:
      type: object
      properties:
        status:
          type: string
          enum: [error]
        error_message:
          type: string
        error_type:
          type: string
          enum: [validation, timeout, server_error, network_error]
        status_code:
          type: number
        validation_details:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              issue:
                type: string

    HealthStatus:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        qdrant_connected:
          type: boolean
        agent_available:
          type: boolean
        timestamp:
          type: string
          format: date-time
```

### 1.3 Quickstart Guide

**Output**: `specs/main/quickstart.md` containing:

```markdown
# Quickstart: Production RAG Chatbot Deployment

## Prerequisites
- Python 3.11+
- Node.js 18+
- Hugging Face account with Space access
- Vercel/Netlify account for frontend deployment

## Backend Deployment (Hugging Face Space)

1. **Prepare HF Space Configuration**
   ```bash
   cd backend
   # Ensure Dockerfile exists and is configured
   # Add .huggingface/Dockerfile if not present
   ```

2. **Configure Environment Variables in HF Space Settings**
   - `OPENROUTER_API_KEY` or `openai_api_key`
   - `QDRANT_URL`
   - `QDRANT_API_KEY`
   - `COHERE_API_KEY`
   - `OPENROUTER_MODEL` (default: openai/gpt-3.5-turbo)
   - `CORS_ORIGINS` (comma-separated frontend URLs)

3. **Deploy to HF Space**
   - Push code to HF Space repository
   - HF automatically builds and deploys Docker container
   - Verify deployment at https://shumailaaijaz-hackathon-book.hf.space/health

## Frontend Deployment (Vercel/Netlify)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment Variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://shumailaaijaz-hackathon-book.hf.space
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   # Deploy to Vercel
   vercel deploy --prod
   ```

4. **Update CORS in HF Space**
   - Add frontend URL to `CORS_ORIGINS` in HF Space settings
   - Restart HF Space container

## Testing

1. **Backend Health Check**
   ```bash
   curl https://shumailaaijaz-hackathon-book.hf.space/health
   ```

2. **Frontend Test Query**
   - Navigate to deployed frontend URL
   - Submit query: "What is Physical AI?"
   - Verify grounded answer with citations appears

## Troubleshooting

- **HF Cold Start**: First request may take 30+ seconds (normal behavior)
- **CORS Errors**: Ensure frontend URL is in `CORS_ORIGINS` environment variable
- **Empty Responses**: Check HF Space logs for backend errors
```

### 1.4 Agent Context Update

**Task**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`

**Technologies to Add**:
- Next.js 14 (frontend framework)
- React 18 (UI library)
- Tailwind CSS 3.3 (styling)
- TypeScript 5.0 (frontend type safety)
- Hugging Face Spaces (backend hosting)
- Vercel/Netlify (frontend hosting)

**Deliverable**: Updated `.claude/context.md` with new technology stack

## Phase 1 Deliverables Checklist

- [ ] `research.md` complete with all decisions documented
- [ ] `data-model.md` complete with entity definitions and validation rules
- [ ] `contracts/openapi.yaml` complete with full API specification
- [ ] `quickstart.md` complete with deployment instructions
- [ ] Agent context updated with new technologies
- [ ] Re-run Constitution Check (no new violations)

## Post-Phase 1: Ready for `/sp.tasks`

After Phase 1 completion, run `/sp.tasks` to generate:
- Concrete implementation tasks with acceptance criteria
- Test cases for each endpoint
- Deployment verification checklist

**Next Command**: `/sp.tasks` (generates `specs/main/tasks.md`)