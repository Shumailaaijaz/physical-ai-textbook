# ChatKit Gemini RAG Chatbot for Physical AI Textbook

A RAG (Retrieval-Augmented Generation) chatbot that integrates OpenAI's ChatKit framework with Google Gemini to provide textbook-grounded Q&A for the Physical AI & Humanoid Robotics textbook.

## Features

- **Dual-mode interaction**: General textbook search (RAG with Qdrant) + selected-text-only queries
- **Citation system**: Clickable citations that navigate to exact textbook sections with highlight animation
- **Vector search**: Qdrant stores 400-token chunks with embeddings for semantic retrieval
- **Streaming responses**: Real-time SSE streaming via ChatKit protocol
- **Embedded UI**: Floating action button + modal popup integrated into Docusaurus textbook
- **Conversation persistence**: Thread history saved to localStorage

## Integration with Existing System

This chatbot coexists with the existing text selection chat system:

- **New ChatKit Chatbot**: Available as floating action button (FAB) on all pages - provides general Q&A with citations
- **Existing Text Selection Chat**: Appears when users select text on pages - provides focused explanations

Both systems use different backends and serve complementary purposes.

## Architecture

- **Frontend**: React + ChatKit (Vite build system)
- **Backend**: FastAPI + LangChain + Qdrant (vector database)
- **LLM**: Google Gemini via LiteLLM
- **Embeddings**: OpenAI text-embedding-3-small
- **Storage**: Qdrant Cloud (vector store), in-memory (Phase 1), Neon Postgres (Phase 2)

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd src/chatbot/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file with your API keys (use `.env.example` as template):
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

5. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Integration

The chatbot is automatically integrated into the Docusaurus site through the Root theme component:
- Located at: `src/theme/Root.tsx`
- Appears as a floating action button on all pages
- Can be configured via `REACT_APP_CHATBOT_API_URL` environment variable

## Environment Variables

### For Docusaurus Integration:
Add to your `.env` file:
```bash
REACT_APP_CHATBOT_API_URL=http://localhost:8000  # Backend API URL
```

### For Backend:
Create a `.env` file in the backend directory with the following variables:

```bash
# AI Models
GEMINI_API_KEY=your_google_ai_studio_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Vector Database
QDRANT_URL=https://your-cluster-url.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# Optional (Phase 2 - Production)
NEON_DB_URL=postgresql://user:pass@host.neon.tech/dbname

# Server Configuration
PORT=8000
LOG_LEVEL=INFO
ENVIRONMENT=development
```

## API Endpoints

- `GET /health` - Health check
- `POST /chatkit` - General RAG chat (textbook-wide queries)
- `POST /chatkit/ask-selected` - Selected-text mode
- `GET /chatkit/threads/{thread_id}/messages` - Get thread messages
- `GET /debug/threads` - Debug endpoint for all threads

## User Stories Implemented

### US1 - Ask Questions About Entire Textbook (P1)
Students can ask questions about any topic in the Physical AI & Humanoid Robotics textbook and receive answers grounded in the textbook content with citations.

### US2 - Ask Questions About Selected Text Only (P1)
Students can highlight specific textbook passages and ask questions that will be answered using ONLY the selected text, without retrieving other content.

### US3 - Resume Previous Conversation (P2)
Students can close the chatbot, refresh the page, or return tomorrow and continue their previous conversation without losing history.

### US4 - Get Started with Suggested Prompts (P3)
New students opening the chatbot for the first time see 3-5 suggested prompts to help them understand what questions they can ask.

## Deployment

1. Set environment variables in your deployment platform
2. Run ingestion script to populate Qdrant with textbook content:
   ```bash
   python backend/ingest.py
   ```
3. Deploy backend to Render/Railway
4. The frontend is automatically integrated into the Docusaurus build

## Testing

Manual testing checklist:

- [ ] Open textbook → FAB button visible bottom-right
- [ ] Click FAB → modal opens (420x600px desktop, full-screen mobile)
- [ ] Type "What is forward kinematics?" → AI responds with citations
- [ ] Click citation `[Chapter 3, Section 2.1]` → navigates to section, highlights yellow for 3 seconds
- [ ] Send follow-up "Can you give an example?" → AI maintains context
- [ ] Highlight 200-word paragraph → chat header shows "📄 47 words selected"
- [ ] Ask "Summarize this" → response constrained to selected text only
- [ ] Citation shows "Based on your selected text" (not clickable)
- [ ] Have 10-message conversation → refresh page → chat loads with full history
- [ ] Click "New Chat" → localStorage cleared, start screen appears

## Success Criteria

- SC-001: Students receive first token of AI response within 2 seconds of sending message
- SC-002: Citation links navigate to correct textbook section and scroll to target paragraph within 500ms of click
- SC-003: Chat modal opens within 300ms of FAB button click on desktop and 500ms on mobile
- SC-004: 90% of student questions receive answers with at least one citation above 0.8 similarity score
- SC-005: Zero hallucinations in responses: 100% of answers verifiable against cited textbook sections
- SC-006: Selected-text mode constrains answers correctly: 0% of responses reference information outside selected passage
- SC-007: 70% of students who open chatbot send at least one message within first session
- SC-008: 50% of chatbot users click at least one citation link to explore textbook source
- SC-009: 30% of returning students resume previous conversation
- SC-010: Average conversation length is 5+ messages
- SC-013: 95% of threads successfully restored from localStorage after page refresh
- SC-014: 95% of citations navigate to correct textbook location