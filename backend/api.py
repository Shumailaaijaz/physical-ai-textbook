"""
FastAPI backend for HuggingFace Space
This version has the /ask endpoint that matches the frontend expectations
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
import requests
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Physical AI Textbook RAG API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[str] = []
    matched_chunks: List[dict] = []
    error: Optional[str] = None
    status: str = "success"
    query_time_ms: float = 0
    confidence: str = "medium"

# Global variables
vectorstore = None
openrouter_api_key = None

def initialize_rag():
    """Initialize RAG system with Qdrant"""
    global vectorstore, openrouter_api_key

    try:
        # Get API keys from environment and strip whitespace/quotes
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "").strip().strip('"').strip("'")
        qdrant_url = os.getenv("QDRANT_URL", "").strip()
        qdrant_api_key = os.getenv("QDRANT_API_KEY", "").strip()
        openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()

        # Validate OpenRouter API key
        if not openrouter_api_key:
            logger.error("❌ OPENROUTER_API_KEY not set in environment")
            return False

        if not openrouter_api_key.startswith("sk-or-v1-"):
            logger.error(f"❌ Invalid OpenRouter API key format. Expected 'sk-or-v1-...', got '{openrouter_api_key[:15]}...'")
            return False

        logger.info(f"✅ OpenRouter API key loaded: {openrouter_api_key[:15]}...{openrouter_api_key[-4:]}")

        if not qdrant_url or not qdrant_api_key:
            logger.warning("Qdrant not configured")
            return False

        # Initialize embeddings
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=openai_api_key
        )

        # Connect to Qdrant
        qdrant_client = QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key
        )

        # Initialize vectorstore
        vectorstore = QdrantVectorStore(
            client=qdrant_client,
            collection_name="textbook_docs",
            embedding=embeddings
        )

        logger.info("✅ RAG system initialized successfully")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to initialize RAG: {e}")
        return False

# Initialize on startup
initialize_rag()

def call_openrouter(prompt: str) -> str:
    """Call OpenRouter API with robust error handling"""

    # Validate API key is loaded
    if not openrouter_api_key:
        error_msg = "OpenRouter API key not initialized. Check your .env file."
        logger.error(f"❌ {error_msg}")
        raise ValueError(error_msg)

    if not openrouter_api_key.startswith("sk-or-v1-"):
        error_msg = f"Invalid API key format: '{openrouter_api_key[:10]}...'"
        logger.error(f"❌ {error_msg}")
        raise ValueError(error_msg)

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://huggingface.co/spaces/shumailaaijaz/hackathon-book",
            "X-Title": "Physical AI RAG Chatbot"
        }

        data = {
            "model": "mistralai/mistral-7b-instruct:free",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }

        logger.info(f"🚀 Calling OpenRouter API with model: {data['model']}")
        response = requests.post(url, headers=headers, json=data, timeout=60)

        # Log response details for debugging
        logger.info(f"📡 OpenRouter response status: {response.status_code}")

        if response.status_code == 401:
            logger.error(f"❌ 401 Unauthorized - API key invalid or expired")
            logger.error(f"   Key used: {openrouter_api_key[:15]}...{openrouter_api_key[-4:]}")
            logger.error(f"   Response: {response.text}")

        response.raise_for_status()

        result = response.json()
        answer = result['choices'][0]['message']['content']
        logger.info(f"✅ OpenRouter API call successful ({len(answer)} chars)")

        return answer

    except requests.exceptions.HTTPError as e:
        logger.error(f"❌ OpenRouter HTTP error: {e}")
        logger.error(f"   Response body: {e.response.text if hasattr(e, 'response') else 'N/A'}")
        raise
    except requests.exceptions.Timeout:
        logger.error("❌ OpenRouter API timeout (60s)")
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ OpenRouter network error: {e}")
        raise
    except (KeyError, IndexError) as e:
        logger.error(f"❌ Unexpected OpenRouter response format: {e}")
        raise
    except Exception as e:
        logger.error(f"❌ OpenRouter API error: {e}")
        raise

@app.get("/")
def root():
    return {
        "message": "RAG Agent API is running",
        "status": "healthy",
        "rag_enabled": vectorstore is not None
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/ask")
async def ask_question(request: QueryRequest):
    """
    Main endpoint - matches frontend expectations
    Returns answer with sources
    """
    import time
    start_time = time.time()

    try:
        query = request.query

        # Retrieve relevant documents if RAG is available
        if vectorstore:
            try:
                # Query Qdrant
                docs = vectorstore.similarity_search(query, k=4)

                # Build context
                context = "\n\n".join([doc.page_content for doc in docs])
                sources = [doc.metadata.get("source", "unknown") for doc in docs]

                # Build prompt with context
                prompt = f"""You are an expert AI assistant for the Physical AI & Humanoid Robotics textbook.

Use the following context from the textbook to answer the question accurately.
If the context doesn't contain enough information, say so.

Context:
{context}

Question: {query}

Provide a clear, detailed answer based on the context above."""

            except Exception as e:
                logger.warning(f"Qdrant query failed: {e}. Using fallback.")
                prompt = f"You are an AI assistant. Answer this question: {query}"
                sources = []
        else:
            # No RAG available
            prompt = f"You are an AI assistant for Physical AI. Answer: {query}"
            sources = []

        # Get answer from LLM
        answer = call_openrouter(prompt)

        # Calculate query time
        query_time = (time.time() - start_time) * 1000

        return QueryResponse(
            answer=answer,
            sources=sources,
            matched_chunks=[],
            error=None,
            status="success",
            query_time_ms=query_time,
            confidence="high" if sources else "low"
        )

    except Exception as e:
        logger.error(f"Error in /ask endpoint: {e}")
        import traceback
        logger.error(traceback.format_exc())

        return QueryResponse(
            answer=f"I encountered an error: {str(e)}",
            sources=[],
            matched_chunks=[],
            error=str(e),
            status="error",
            query_time_ms=0,
            confidence="none"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)  # HuggingFace uses port 7860
