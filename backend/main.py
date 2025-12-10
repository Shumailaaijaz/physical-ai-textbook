import os
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import json

# Import for ChatKit
from openai_chatkit import Agent

# Import for LangChain and RAG
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant
from langchain_community.chat_models import ChatLiteLLM

# Import for Qdrant
from qdrant_client import QdrantClient, models

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS for Docusaurus frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for threads and messages (Phase 1)
class MemoryStore:
    def __init__(self):
        self.threads: Dict[str, Dict] = {}
        self.messages: Dict[str, List[Dict]] = {}

    def create_thread(self):
        thread_id = f"thread_{uuid.uuid4().hex}"
        self.threads[thread_id] = {
            "id": thread_id,
            "created_at": datetime.now(),
            "last_message_at": None,
            "metadata": {}
        }
        self.messages[thread_id] = []
        return thread_id

    def add_message(self, thread_id: str, message: Dict):
        if thread_id not in self.messages:
            raise ValueError(f"Thread {thread_id} not found")
        self.messages[thread_id].append(message)
        self.threads[thread_id]["last_message_at"] = datetime.now()

    def get_thread(self, thread_id: str):
        if thread_id not in self.threads:
            return None
        return {
            "thread": self.threads[thread_id],
            "messages": self.messages[thread_id]
        }

memory_store = MemoryStore()

# Initialize LangChain components
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

vector_store = Qdrant(
    client=qdrant_client,
    collection_name="textbook_chunks",
    embeddings=embeddings,
)

# Initialize LLM with Gemini via LiteLLM
llm = ChatLiteLLM(
    model="gemini/gemini-2.0-flash",
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

@app.get("/health")
async def health_check():
    try:
        # Test Qdrant connection
        collections = qdrant_client.get_collections()
        vector_count = 0
        for collection in collections.collections:
            if collection.name == "textbook_chunks":
                points_count = qdrant_client.count(collection_name="textbook_chunks")
                vector_count = points_count.count
                break

        return {
            "status": "ok",
            "model": "gemini-2.0-flash",
            "qdrant_status": "connected",
            "qdrant_collection": "textbook_chunks",
            "qdrant_vectors": vector_count
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

# ChatKit protocol handler
async def respond(items: List[Dict]):
    """ChatKit protocol responder that yields SSE events"""
    # Extract the last user message
    user_message = None
    for item in reversed(items):
        if item.get("role") == "user":
            user_message = item
            break

    if not user_message:
        raise HTTPException(status_code=400, detail="No user message found")

    query = user_message.get("content", "")

    # Create a new assistant message
    assistant_id = f"msg_{uuid.uuid4().hex[:8]}"
    old_id_to_new_id = {}

    # Yield ThreadItemAdded event
    event_data = {
        "type": "ThreadItemAdded",
        "item": {
            "id": assistant_id,
            "role": "assistant",
            "content": ""
        }
    }
    yield f"event: thread.item.added\n"
    yield f"data: {json.dumps(event_data)}\n\n"

    # Process with RAG
    try:
        result = qa_chain({"query": query})
        answer = result["result"]
        source_documents = result.get("source_documents", [])

        # Extract citations from source documents
        citations = []
        for doc in source_documents:
            metadata = doc.metadata
            citations.append({
                "chunk_id": metadata.get("chunk_id", ""),
                "chapter": metadata.get("chapter", ""),
                "section": metadata.get("section", ""),
                "heading": metadata.get("heading", ""),
                "url": metadata.get("url", ""),
                "similarity_score": float(metadata.get("similarity_score", 0.0)),
                "preview_text": doc.page_content[:100] + "..." if len(doc.page_content) > 100 else doc.page_content
            })

        # Stream the response character by character
        for i, char in enumerate(answer):
            event_data = {
                "type": "ThreadItemUpdated",
                "item": {
                    "id": assistant_id,
                    "content": answer[:i+1]
                }
            }
            yield f"event: thread.item.updated\n"
            yield f"data: {json.dumps(event_data)}\n\n"
            await asyncio.sleep(0.01)  # Small delay to simulate streaming

        # Yield ThreadItemDone event with citations
        event_data = {
            "type": "ThreadItemDone",
            "item": {
                "id": assistant_id,
                "content": answer,
                "citations": citations
            }
        }
        yield f"event: thread.item.done\n"
        yield f"data: {json.dumps(event_data)}\n\n"

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        error_msg = f"I encountered an error processing your question: {str(e)}"
        event_data = {
            "type": "ThreadItemUpdated",
            "item": {
                "id": assistant_id,
                "content": error_msg
            }
        }
        yield f"event: thread.item.updated\n"
        yield f"data: {json.dumps(event_data)}\n\n"

        event_data = {
            "type": "ThreadItemDone",
            "item": {
                "id": assistant_id,
                "content": error_msg
            }
        }
        yield f"event: thread.item.done\n"
        yield f"data: {json.dumps(event_data)}\n\n"

# POST /chatkit endpoint for general RAG
@app.post("/chatkit")
async def chatkit_endpoint(items: List[Dict]):
    """General RAG chat endpoint using ChatKit protocol"""
    logger.info(f"Received chat request with {len(items)} items")

    # Log query for debugging
    user_message = None
    for item in reversed(items):
        if item.get("role") == "user":
            user_message = item
            break

    if user_message:
        logger.info(f"Query: {user_message.get('content', 'N/A')}")

    # Return streaming response
    return StreamingResponse(
        respond(items),
        media_type="text/event-stream"
    )

# POST /chatkit/ask-selected endpoint for selected-text mode
@app.post("/chatkit/ask-selected")
async def ask_selected_endpoint(data: Dict):
    """Selected-text mode endpoint that answers using only provided text"""
    thread_id = data.get("thread_id")
    query = data.get("query", "")
    selected_text = data.get("selected_text", "")
    items = data.get("items", [])

    # Validate selected text length
    word_count = len(selected_text.split())
    if word_count < 10:
        raise HTTPException(status_code=400, detail="Selected text too short (minimum 10 words)")
    if word_count > 2000:
        raise HTTPException(status_code=400, detail="Selected text too long (maximum 2000 words)")

    logger.info(f"Selected-text query: {query}, word count: {word_count}")

    # Create a new assistant message
    assistant_id = f"msg_{uuid.uuid4().hex[:8]}"

    # Create streaming response for selected-text mode
    async def selected_text_respond():
        # Yield ThreadItemAdded event
        event_data = {
            "type": "ThreadItemAdded",
            "item": {
                "id": assistant_id,
                "role": "assistant",
                "content": ""
            }
        }
        yield f"event: thread.item.added\n"
        yield f"data: {json.dumps(event_data)}\n\n"

        try:
            # Create prompt for selected-text mode
            prompt = f"Answer using ONLY the provided text selection. Do not use external knowledge.\n\nSelected text: {selected_text}\n\nQuestion: {query}"

            # Get response from LLM using the same llm instance (ChatLiteLLM with Gemini)
            from langchain_core.messages import HumanMessage
            messages = [HumanMessage(content=prompt)]
            response = llm.invoke(messages)
            answer = response.content

            # Stream the response character by character
            for i, char in enumerate(answer):
                event_data = {
                    "type": "ThreadItemUpdated",
                    "item": {
                        "id": assistant_id,
                        "content": answer[:i+1]
                    }
                }
                yield f"event: thread.item.updated\n"
                yield f"data: {json.dumps(event_data)}\n\n"
                await asyncio.sleep(0.01)  # Small delay to simulate streaming

            # Yield ThreadItemDone event with special citation for selected-text mode
            event_data = {
                "type": "ThreadItemDone",
                "item": {
                    "id": assistant_id,
                    "content": answer,
                    "citations": [{"text": "Based on your selected text"}]
                }
            }
            yield f"event: thread.item.done\n"
            yield f"data: {json.dumps(event_data)}\n\n"

        except Exception as e:
            logger.error(f"Error processing selected-text query: {str(e)}")
            error_msg = f"I encountered an error processing your question: {str(e)}"
            event_data = {
                "type": "ThreadItemUpdated",
                "item": {
                    "id": assistant_id,
                    "content": error_msg
                }
            }
            yield f"event: thread.item.updated\n"
            yield f"data: {json.dumps(event_data)}\n\n"

            event_data = {
                "type": "ThreadItemDone",
                "item": {
                    "id": assistant_id,
                    "content": error_msg
                }
            }
            yield f"event: thread.item.done\n"
            yield f"data: {json.dumps(event_data)}\n\n"

    return StreamingResponse(
        selected_text_respond(),
        media_type="text/event-stream"
    )

# GET /chatkit/threads/{thread_id}/messages endpoint for message history
@app.get("/chatkit/threads/{thread_id}/messages")
async def get_thread_messages(thread_id: str):
    """Return message history for a thread"""
    thread_data = memory_store.get_thread(thread_id)
    if not thread_data:
        raise HTTPException(status_code=404, detail="Thread not found")

    return {
        "thread_id": thread_id,
        "messages": thread_data["messages"],
        "created_at": thread_data["thread"]["created_at"],
        "last_message_at": thread_data["thread"]["last_message_at"]
    }

# GET /debug/threads endpoint for debugging
@app.get("/debug/threads")
async def debug_threads():
    """Return all threads for debugging purposes"""
    threads_info = {}
    for thread_id, thread_data in memory_store.threads.items():
        threads_info[thread_id] = {
            "message_count": len(memory_store.messages.get(thread_id, [])),
            "created_at": thread_data["created_at"],
            "last_message_at": thread_data["last_message_at"],
            "metadata": thread_data["metadata"]
        }

    return {
        "total_threads": len(threads_info),
        "threads": threads_info
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))