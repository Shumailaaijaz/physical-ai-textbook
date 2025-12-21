from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
import logging
import requests
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Physical AI Textbook RAG API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []

# Initialize RAG components
rag_chain = None
vectorstore = None

def call_openrouter_api(prompt: str, api_key: str) -> str:
    """Call OpenRouter API directly using requests"""
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "mistralai/mistral-7b-instruct:free",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content']
    except Exception as e:
        logger.error(f"Error calling OpenRouter API: {e}")
        raise

def initialize_rag():
    """Initialize the RAG system with Qdrant vector store"""
    global rag_chain, vectorstore

    try:
        # Get API key
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")

        if not openrouter_api_key:
            logger.error("OPENROUTER_API_KEY not found in environment variables")
            return False

        # Initialize embeddings (using OpenRouter - skipping for now as OpenRouter may not support embeddings the same way)
        # We'll skip embeddings initialization if not needed
        embeddings = None

        # Initialize Qdrant client (skip if not configured)
        qdrant_url = os.getenv("QDRANT_URL", "")
        qdrant_api_key = os.getenv("QDRANT_API_KEY", "")

        # Only try to connect if Qdrant is properly configured
        if qdrant_url and qdrant_api_key and "your-qdrant-cluster" not in qdrant_url:
            try:
                if "cloud.qdrant.io" in qdrant_url:
                    qdrant_client = QdrantClient(
                        url=qdrant_url,
                        api_key=qdrant_api_key
                    )
                else:
                    qdrant_client = QdrantClient(host="localhost", port=6333)

                # Connect to existing vector store
                vectorstore = Qdrant(
                    client=qdrant_client,
                    collection_name="textbook_docs",
                    embeddings=embeddings,
                )
                logger.info("Connected to Qdrant successfully")
            except Exception as e:
                logger.warning(f"Could not connect to Qdrant: {e}. Running without RAG.")
                vectorstore = None
        else:
            logger.info("Qdrant not configured. Running without RAG.")
            vectorstore = None

        # Create retriever if vectorstore is available
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4}) if vectorstore else None

        # Store retriever and API key for use in chat endpoint
        rag_chain = {"api_key": openrouter_api_key, "retriever": retriever}

        logger.info("RAG system initialized successfully with OpenRouter")
        return True

    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {e}")
        return False

# Initialize RAG on module load for serverless
initialize_rag()

@app.get("/")
def read_root():
    return {
        "message": "Physical AI Textbook RAG API",
        "status": "running",
        "rag_initialized": rag_chain is not None
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "rag_initialized": rag_chain is not None
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Check if RAG is initialized
        if rag_chain is None:
            # Try to initialize if not already done
            if not initialize_rag():
                return ChatResponse(
                    response="RAG system is not initialized. Please check your environment variables.",
                    sources=["system"]
                )

        # Get API key and retriever
        api_key = rag_chain["api_key"]
        retriever = rag_chain["retriever"]

        # If retriever is available, use RAG
        if retriever:
            try:
                docs = retriever.invoke(request.message)

                # Build context from retrieved documents
                context = "\n\n".join([doc.page_content for doc in docs])

                # Create the prompt with context
                prompt_text = f"""You are a helpful AI assistant for the Physical AI & Humanoid Robotics textbook.
Use the following context to answer the user's question. If you don't know the answer, say so.

Context: {context}

Question: {request.message}

Answer:"""

                # Extract sources
                sources = [doc.metadata.get("source", "unknown") for doc in docs]
            except Exception as e:
                logger.warning(f"Could not retrieve documents: {e}. Using direct LLM response.")
                prompt_text = f"""You are a helpful AI assistant for Physical AI & Humanoid Robotics.

Question: {request.message}

Answer:"""
                sources = ["direct-llm"]
        else:
            # No RAG, use direct LLM
            prompt_text = f"""You are a helpful AI assistant for Physical AI & Humanoid Robotics.

Question: {request.message}

Answer:"""
            sources = ["direct-llm"]

        # Get response from OpenRouter API
        response_text = call_openrouter_api(prompt_text, api_key)

        return ChatResponse(
            response=response_text,
            sources=list(set(sources))  # Remove duplicates
        )

    except Exception as e:
        import traceback
        logger.error(f"Error processing chat request: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)