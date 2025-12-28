"""
Add this code to your existing HuggingFace Space app.py
This adds an /ask endpoint that adapts to your existing /chat endpoint
"""

# Add this import at the top with your other imports
from pydantic import BaseModel

# Add this request model
class AskRequest(BaseModel):
    query: str

# Add this response model
class AskResponse(BaseModel):
    answer: str
    sources: list = []
    matched_chunks: list = []
    error: str = None
    status: str = "success"
    query_time_ms: float = 0
    confidence: str = "medium"

# Add this endpoint to your existing app.py
@app.post("/ask", response_model=AskResponse)
async def ask_endpoint(request: AskRequest):
    """
    Adapter endpoint for frontend compatibility
    Calls the existing /chat endpoint and adapts the response
    """
    try:
        import time
        start_time = time.time()

        # Call your existing chat logic
        # Assuming you have a chat function or can reuse the logic
        # You'll need to adapt this to call your actual chat handler

        # For now, create a simple request to your chat endpoint
        from fastapi import Request as FastAPIRequest

        # Create a mock request object for the chat endpoint
        chat_request = {
            "query": request.query,
            "selected_text": None,
            "session_id": None
        }

        # Import your chat endpoint handler
        # Replace 'chat_endpoint' with your actual function name
        response = await chat_endpoint(chat_request)

        # Calculate query time
        query_time = (time.time() - start_time) * 1000

        # Adapt the response format
        if hasattr(response, 'text'):
            # GroundedAnswer format
            return AskResponse(
                answer=response.text,
                sources=response.citations if hasattr(response, 'citations') else [],
                matched_chunks=[],
                error=None,
                status="success",
                query_time_ms=query_time,
                confidence="high"
            )
        elif hasattr(response, 'reason'):
            # RefusalMessage format
            return AskResponse(
                answer=f"Unable to answer: {response.reason}",
                sources=[],
                matched_chunks=[],
                error=response.reason,
                status="error",
                query_time_ms=query_time,
                confidence="none"
            )

    except Exception as e:
        import traceback
        print(f"Error in /ask endpoint: {e}")
        print(traceback.format_exc())

        return AskResponse(
            answer=f"Error: {str(e)}",
            sources=[],
            matched_chunks=[],
            error=str(e),
            status="error",
            query_time_ms=0,
            confidence="none"
        )
