"""
FastAPI Backend Integration for Docusaurus Chatbot

This API server provides a /chat endpoint that integrates the existing
Docusaurus chatbot UI with the RAG answer generation agent.

Endpoints:
- POST /chat: Submit query and receive grounded answer with citations
- GET /health: Health check

Port: 8000
CORS Origin: http://localhost:3000 (Docusaurus dev server)

Usage:
    uvicorn api:app --host 0.0.0.0 --port 8000

Author: Claude Code
Date: 2025-12-26
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv

# Import agent functions from src/chatbot/backend/agent.py
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "chatbot", "backend"))
from agent import (
    load_environment,
    connect_qdrant,
    search_qdrant_tool,
    create_rag_agent,
    query_agent,
    GroundedAnswer,
    RefusalMessage,
    Citation
)

# =============================================================================
# Pydantic Request/Response Models
# =============================================================================

class ChatRequest(BaseModel):
    """Request model for /chat endpoint."""
    query: str = Field(..., min_length=1, max_length=1000, description="User's question about Physical AI textbook")
    selected_text: Optional[str] = Field(None, max_length=5000, description="User-highlighted text for contextual queries")
    session_id: Optional[str] = Field(None, pattern="^[a-zA-Z0-9_-]+$", description="Optional session identifier")

    @field_validator('query')
    @classmethod
    def query_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Query cannot be empty or whitespace only')
        return v.strip()


# =============================================================================
# Environment Loading
# =============================================================================

# Load environment variables
load_dotenv()

# Initialize environment variables from agent.py
try:
    env_vars = load_environment()
except ValueError as e:
    print(f"[WARNING] Environment loading failed: {e}")
    print("[WARNING] API will fail on /chat requests until environment is configured")
    env_vars = None


# =============================================================================
# FastAPI Application
# =============================================================================

# Initialize FastAPI app
app = FastAPI(
    title="Physical AI RAG Chatbot API",
    description="Backend API for querying Physical AI textbook via RAG system",
    version="1.0.0"
)

# Configure CORS for Docusaurus frontend
CORS_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Endpoints (Phase 3 - MVP)
# =============================================================================

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    """
    POST /chat - Query Physical AI textbook via RAG system

    Request body:
        - query (str, required): User's question (1-1000 chars)
        - selected_text (str, optional): User-highlighted text (max 5000 chars)
        - session_id (str, optional): Session identifier

    Response:
        - GroundedAnswer: {text: str, citations: list, mode: str}
        - RefusalMessage: {reason: str, refusal_type: str}

    Status codes:
        - 200: Success (GroundedAnswer or RefusalMessage)
        - 400: Validation error (malformed request)
        - 500: Internal server error (Qdrant/API failure)
    """
    # Check environment variables are loaded
    if env_vars is None:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Server configuration error",
                "message": "Environment variables not configured. Check .env file and required API keys."
            }
        )

    try:
        # Connect to Qdrant
        qdrant_client = connect_qdrant(env_vars)

        # Determine mode based on selected_text parameter
        mode = "selected_text_only" if request.selected_text else "standard_rag"

        # Perform retrieval
        chunks = search_qdrant_tool(
            client=qdrant_client,
            query=request.query,
            cohere_api_key=env_vars['COHERE_API_KEY'],
            top_k=5,
            selected_text=request.selected_text
        )

        # Create OpenAI agent
        openai_client = create_rag_agent(env_vars)

        # Query agent
        result = query_agent(
            client=openai_client,
            chunks=chunks,
            query=request.query,
            model=env_vars['MODEL'],
            mode=mode
        )

        # Return native agent.py output as-is
        if isinstance(result, GroundedAnswer):
            # Convert NamedTuple to dict for JSON serialization
            return {
                "text": result.text,
                "citations": [
                    {
                        "chapter": citation.chapter,
                        "section": citation.section,
                        "source_url": citation.source_url,
                        "referenced_text": citation.referenced_text
                    }
                    for citation in result.citations
                ],
                "mode": result.mode
            }
        elif isinstance(result, RefusalMessage):
            # Convert NamedTuple to dict for JSON serialization
            return {
                "reason": result.reason,
                "refusal_type": result.refusal_type
            }
        else:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Unexpected response type",
                    "message": "Agent returned unexpected result type"
                }
            )

    except ValueError as e:
        # Environment/validation errors
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Validation error",
                "message": str(e)
            }
        )

    except ConnectionError as e:
        # Qdrant connection failures
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Database connection error",
                "message": str(e)
            }
        )

    except RuntimeError as e:
        # Agent/API errors
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Backend processing error",
                "message": str(e)
            }
        )

    except Exception as e:
        # Unexpected errors
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": f"Unexpected error: {str(e)}"
            }
        )


@app.get("/health")
def health_check():
    """
    GET /health - Health check endpoint

    Returns:
        dict: Status 200 with health status
    """
    return {
        "status": "healthy",
        "service": "Physical AI RAG Chatbot API",
        "version": "1.0.0",
        "environment_configured": env_vars is not None
    }


class QueryRequest(BaseModel):
    """Request model for /query endpoint (frontend compatibility)."""
    query: str = Field(..., min_length=1, max_length=1000)


@app.post("/query")
def query_endpoint(request: QueryRequest):
    """
    POST /query - Frontend-compatible endpoint

    Request: {query: str}
    Response: {answer: str, citations: [...], timestamp: int}
    """
    import time

    # Call the chat endpoint internally
    chat_request = ChatRequest(query=request.query)
    result = chat_endpoint(chat_request)

    # Transform response to frontend format
    if "text" in result:  # GroundedAnswer
        return {
            "answer": result["text"],
            "citations": result["citations"],
            "timestamp": int(time.time())
        }
    else:  # RefusalMessage
        return {
            "answer": result["reason"],
            "citations": [],
            "timestamp": int(time.time())
        }
