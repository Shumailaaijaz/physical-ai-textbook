from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
import logging

# Import for LangChain and RAG
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIEmbeddings
from langchain_community.chat_models import ChatLiteLLM

# Import for Qdrant (will be used when available)
try:
    from langchain_community.vectorstores import Qdrant
    from qdrant_client import QdrantClient, models
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False

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

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []

# Initialize components based on availability
if QDRANT_AVAILABLE:
    # Initialize LangChain components
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    # Initialize Qdrant client (can be local or cloud)
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if qdrant_api_key:
        qdrant_client = QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key
        )
    else:
        qdrant_client = QdrantClient(host="localhost", port=6333)

    # Initialize vector store
    try:
        vector_store = Qdrant(
            client=qdrant_client,
            collection_name="textbook_docs",
            embeddings=embeddings,
        )

        # Initialize LLM
        llm = OpenRouter(
            model="mistralai/devstral-2512:free",  # Using Mistral via LiteLLM
            temperature=0.2,
            max_tokens=500
        )

        # Create RAG chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vector_store.as_retriever(
                search_kwargs={
                    "k": 5,
                    "score_threshold": 0.7
                }
            ),
            return_source_documents=True,
        )
        RAG_AVAILABLE = True
    except Exception as e:
        logger.warning(f"Could not initialize Qdrant: {e}")
        RAG_AVAILABLE = False
else:
    logger.warning("Qdrant not available, RAG functionality will be limited")
    RAG_AVAILABLE = False

@app.get("/")
def read_root():
    return {"message": "Physical AI Textbook RAG API", "status": "running", "rag_available": RAG_AVAILABLE}

@app.get("/health")
def health_check():
    return {"status": "healthy", "rag_available": RAG_AVAILABLE}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if RAG_AVAILABLE:
        try:
            # Process the query using RAG
            result = qa_chain({"query": request.message})

            response = result["result"]
            source_documents = result.get("source_documents", [])

            # Extract source information
            sources = []
            for doc in source_documents:
                source_info = doc.metadata.get("source", "Unknown")
                sources.append(source_info)

            return ChatResponse(response=response, sources=sources)

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")
    else:
        # Fallback response when RAG is not available
        return ChatResponse(
            response="RAG system is not fully configured. Please set up Qdrant and environment variables.",
            sources=["system"]
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)