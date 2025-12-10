"""
FastAPI Application - ChatKit Gemini RAG Chatbot
Main application with RAG pipeline, ChatKit integration, and vector search
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv
import os
import logging
import uuid

# Import RAG service
from app.services.rag import get_rag_service, query_selected_text

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global RAG service instance
rag_service = None

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class Message(BaseModel):
    """Message model for ChatKit protocol"""
    id: str
    role: str  # "user" or "assistant"
    content: str
    created_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

class ThreadRequest(BaseModel):
    """Request model for chat threads"""
    thread_id: Optional[str] = None
    items: List[Message]

class Citation(BaseModel):
    """Citation model for textbook references"""
    chunk_id: str
    chapter: int
    section: str
    url: str
    similarity_score: float
    preview_text: str

class SelectedTextRequest(BaseModel):
    """Request model for selected-text mode"""
    thread_id: Optional[str] = None
    query: str
    selected_text: str
    items: List[Message]

# ============================================================================
# IN-MEMORY STORE (Phase 1 - T007)
# ============================================================================

class MemoryStore:
    """
    In-memory storage for threads and messages
    Phase 2 will migrate to Neon Postgres
    """

    def __init__(self):
        self.threads: Dict[str, Dict[str, Any]] = {}
        logger.info("MemoryStore initialized")

    def create_thread(self, thread_id: Optional[str] = None) -> str:
        """Create a new thread"""
        if thread_id is None:
            thread_id = f"thread_{uuid.uuid4().hex[:12]}"

        self.threads[thread_id] = {
            "id": thread_id,
            "messages": [],
            "created_at": datetime.utcnow().isoformat(),
            "last_message_at": datetime.utcnow().isoformat(),
            "metadata": {}
        }
        logger.info(f"Created thread: {thread_id}")
        return thread_id

    def add_message(self, thread_id: str, message: Message) -> None:
        """Add message to thread"""
        if thread_id not in self.threads:
            self.create_thread(thread_id)

        self.threads[thread_id]["messages"].append(message.dict())
        self.threads[thread_id]["last_message_at"] = datetime.utcnow().isoformat()
        logger.info(f"Added message to thread {thread_id}: {message.role}")

    def get_thread(self, thread_id: str) -> Optional[Dict[str, Any]]:
        """Get thread by ID"""
        return self.threads.get(thread_id)

    def get_messages(self, thread_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get messages from thread"""
        thread = self.get_thread(thread_id)
        if not thread:
            return []
        return thread["messages"][-limit:]

    def delete_thread(self, thread_id: str) -> bool:
        """Delete thread"""
        if thread_id in self.threads:
            del self.threads[thread_id]
            logger.info(f"Deleted thread: {thread_id}")
            return True
        return False

    def get_all_threads(self) -> List[Dict[str, Any]]:
        """Get all threads (for debug endpoint)"""
        return [
            {
                "thread_id": tid,
                "message_count": len(thread["messages"]),
                "created_at": thread["created_at"],
                "last_message_at": thread["last_message_at"]
            }
            for tid, thread in self.threads.items()
        ]

# Initialize global memory store
memory_store = MemoryStore()

# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="ChatKit Gemini RAG Chatbot API",
    description="RAG-powered chatbot for Physical AI & Humanoid Robotics textbook",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# HEALTH & DEBUG ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "ChatKit Gemini RAG Chatbot API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "chatkit": "/chatkit",
            "ask_selected": "/chatkit/ask-selected",
            "debug": "/debug/threads"
        }
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint (T004)
    Returns API status and configuration info
    """
    # Check environment variables
    env_status = {
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "qdrant_configured": bool(os.getenv("QDRANT_URL")) and bool(os.getenv("QDRANT_API_KEY"))
    }

    return {
        "status": "ok",
        "version": "0.1.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "model": "gemini-2.0-flash",
        "embedding_model": "text-embedding-3-small",
        "environment_check": env_status,
        "threads_count": len(memory_store.threads)
    }

@app.get("/debug/threads")
async def debug_threads():
    """
    Debug endpoint to inspect all threads (T040)
    Development only - should be disabled in production
    """
    if os.getenv("ENVIRONMENT") == "production":
        raise HTTPException(status_code=403, detail="Debug endpoint disabled in production")

    return {
        "total_threads": len(memory_store.threads),
        "threads": memory_store.get_all_threads()
    }

@app.get("/debug/threads/{thread_id}")
async def debug_thread_detail(thread_id: str):
    """Get detailed thread information"""
    if os.getenv("ENVIRONMENT") == "production":
        raise HTTPException(status_code=403, detail="Debug endpoint disabled in production")

    thread = memory_store.get_thread(thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail=f"Thread {thread_id} not found")

    return thread

# ============================================================================
# CHATKIT ENDPOINTS (Placeholders - T014-T018)
# ============================================================================

@app.post("/chatkit")
async def chatkit_endpoint(request: ThreadRequest):
    """
    Main ChatKit endpoint for general textbook Q&A (T014)

    This endpoint:
    1. Extracts user message from items
    2. Performs RAG: embed query -> Qdrant search -> GPT generation
    3. Returns response with citations

    Returns:
        {
            "thread_id": str,
            "answer": str,
            "citations": List[Citation],
            "message_id": str
        }
    """
    global rag_service

    # Create or get thread
    thread_id = request.thread_id or memory_store.create_thread()

    # Extract last user message
    user_messages = [item for item in request.items if item.role == "user"]
    if not user_messages:
        raise HTTPException(status_code=400, detail="No user message found")

    last_message = user_messages[-1]

    # Store user message
    memory_store.add_message(thread_id, last_message)

    logger.info(f"ChatKit request - Thread: {thread_id}, Query: {last_message.content[:50]}...")

    try:
        # Perform RAG query
        result = await rag_service.query(last_message.content)

        # Create assistant message
        assistant_message = Message(
            id=f"msg_{uuid.uuid4().hex[:12]}",
            role="assistant",
            content=result["answer"],
            created_at=datetime.utcnow().isoformat(),
            metadata={
                "citations": result["citations"],
                "source_count": len(result["source_documents"])
            }
        )

        # Store assistant message
        memory_store.add_message(thread_id, assistant_message)

        # Return response
        return JSONResponse(content={
            "thread_id": thread_id,
            "answer": result["answer"],
            "citations": result["citations"],
            "message_id": assistant_message.id
        })

    except Exception as e:
        logger.error(f"Error in ChatKit endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")

@app.post("/chatkit/ask-selected")
async def ask_selected_endpoint(request: SelectedTextRequest):
    """
    Selected-text mode endpoint (T026-T029)
    Answers questions using ONLY the selected text

    Returns:
        {
            "thread_id": str,
            "answer": str,
            "selected_text_length": int,
            "message_id": str
        }
    """
    # Validate selected text length
    word_count = len(request.selected_text.split())
    if word_count < 10:
        raise HTTPException(status_code=400, detail="Selected text too short (minimum 10 words)")
    if word_count > 2000:
        raise HTTPException(status_code=400, detail="Selected text too long (maximum 2000 words)")

    # Create or get thread
    thread_id = request.thread_id or memory_store.create_thread()

    logger.info(f"Selected-text request - Thread: {thread_id}, Words: {word_count}")

    try:
        # Query using only selected text
        answer = await query_selected_text(request.query, request.selected_text)

        # Create assistant message
        assistant_message = Message(
            id=f"msg_{uuid.uuid4().hex[:12]}",
            role="assistant",
            content=answer,
            created_at=datetime.utcnow().isoformat(),
            metadata={
                "mode": "selected_text",
                "selected_text_length": word_count
            }
        )

        # Store assistant message
        memory_store.add_message(thread_id, assistant_message)

        # Return response
        return JSONResponse(content={
            "thread_id": thread_id,
            "answer": answer,
            "selected_text_length": word_count,
            "message_id": assistant_message.id
        })

    except Exception as e:
        logger.error(f"Error in selected-text endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Selected-text query failed: {str(e)}")

@app.get("/chatkit/threads/{thread_id}/messages")
async def get_thread_messages(thread_id: str, limit: int = 100):
    """
    Get message history for a thread (T035)
    Used for conversation persistence
    """
    thread = memory_store.get_thread(thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail=f"Thread {thread_id} not found")

    messages = memory_store.get_messages(thread_id, limit)

    return {
        "thread_id": thread_id,
        "messages": messages,
        "total": len(messages)
    }

# ============================================================================
# APPLICATION STARTUP
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Application startup tasks"""
    logger.info("=" * 60)
    logger.info("ChatKit Gemini RAG Chatbot API Starting...")
    logger.info("=" * 60)
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Port: {os.getenv('PORT', 8000)}")
    logger.info(f"Log Level: {os.getenv('LOG_LEVEL', 'INFO')}")
    logger.info(f"CORS Origins: {ALLOWED_ORIGINS}")
    logger.info("=" * 60)

    # TODO: Initialize RAG components in Phase 2
    # - Initialize Qdrant client
    # - Initialize OpenAI embeddings
    # - Initialize LangChain RetrievalQA chain
    # - Initialize Gemini LLM via LiteLLM

    logger.info("MemoryStore:  Ready")
    logger.info("RAG Pipeline: � Not yet implemented")
    logger.info("ChatKit Endpoints:  Placeholder ready")
    logger.info("=" * 60)

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown tasks"""
    logger.info("Shutting down ChatKit Gemini RAG Chatbot API...")
    # TODO: Cleanup tasks (close DB connections, etc.)

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
