from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Physical AI Textbook API", version="1.0.0")

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

@app.get("/")
def read_root():
    return {"message": "Physical AI Textbook API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # For now, return a simple response to test the connection
    # In a full implementation, this would connect to your RAG system
    response_text = f"Received your message: '{request.message}'. The RAG system is not yet fully configured. Please set up Qdrant and environment variables."
    return ChatResponse(response=response_text, sources=["system"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)