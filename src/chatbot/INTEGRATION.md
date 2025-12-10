# Chatbot Integration Guide

This project includes two chat systems:

## 1. Existing Text Selection Chat
- Located in `src/TextSelectionChat/index.tsx`
- Uses existing `src/services/chatService.ts`
- API endpoints: `/api/chat`, `/api/chat/selected` (from server directory)
- Triggers when users select text on pages
- Simpler interface focused on text explanation

## 2. New ChatKit Gemini RAG Chatbot
- Located in `src/chatbot/frontend/src/components/ChatbotWidget.tsx`
- Uses ChatKit framework with SSE streaming
- API endpoints: `/chatkit`, `/chatkit/ask-selected`, `/chatkit/threads/{id}/messages` (from chatbot backend)
- Appears as floating action button (FAB) on all pages
- Full-featured chat with citations and dual-mode interaction

## Integration
Both systems are active and serve different purposes:
- The floating chatbot (ChatKit) provides general textbook Q&A with citations
- The text selection chat provides focused explanations of selected content
- They use different backend services and will not conflict

## Configuration
- Main chatbot API URL: Set via `REACT_APP_CHATBOT_API_URL` environment variable
- Default: `http://localhost:8000` (for development)

## Running the Systems

### For the ChatKit chatbot:
1. Start the chatbot backend: `cd src/chatbot/backend && uvicorn main:app --reload`
2. Ensure Qdrant is configured and populated with textbook content
3. The floating button will connect to the backend API

### For the existing text selection chat:
1. Uses the existing server backend
2. No additional setup needed if server is running