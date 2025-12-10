# Physical AI Textbook RAG Backend

This is the RAG (Retrieval-Augmented Generation) backend for the Physical AI Textbook project. It uses Python, FastAPI, LangChain, and Qdrant to provide AI-powered responses based on the textbook content.

## Prerequisites

- Python 3.9 or higher
- pip (Python package installer)
- Node.js and npm (for scripts management)

## Setup

1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

   Or using the npm script:
   ```bash
   npm run install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your configuration:
   - `QDRANT_URL`: Your Qdrant vector database URL
   - `QDRANT_API_KEY`: Your Qdrant API key
   - `OPENAI_API_KEY`: Your OpenAI API key (for embeddings)
   - `LITELLM_API_KEY`: Your LiteLLM provider API key (for Gemini access)

3. Ingest the textbook content into the vector database:
   ```bash
   python ingest.py
   ```

   Or using the npm script:
   ```bash
   npm run ingest
   ```

## Running the Server

Start the backend server:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Or using the npm script:
```bash
npm run dev
```

The server will be available at `http://localhost:8000`.

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /chatkit` - Main RAG chat endpoint using ChatKit protocol
- `POST /chatkit/ask-selected` - Selected-text mode endpoint
- `GET /chatkit/threads/{thread_id}/messages` - Thread message history
- `GET /debug/threads` - Debug endpoint for viewing all threads

## Frontend Integration

The frontend is configured to connect to this backend via the `REACT_APP_CHATBOT_API_URL` environment variable in `.env`. By default, it connects to `http://localhost:8000`.

## Architecture

- **FastAPI**: Web framework for the backend API
- **LangChain**: Framework for RAG implementation
- **Qdrant**: Vector database for storing textbook embeddings
- **Gemini**: LLM for generating responses via LiteLLM
- **ChatKit Protocol**: Streaming response protocol for the chat interface

## Troubleshooting

If you encounter issues:
1. Verify all environment variables are properly set
2. Ensure the Qdrant database is accessible
3. Check that the vector database has been populated with textbook content
4. Confirm the frontend and backend are both running