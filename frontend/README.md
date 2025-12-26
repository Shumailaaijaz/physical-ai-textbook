# Physical AI Chatbot - Frontend

A minimal Next.js chatbot UI for a RAG (Retrieval-Augmented Generation) system focused on Physical AI and robotics.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.3
- **Runtime**: React 18

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm installed
- Port 3000 available

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at **http://localhost:3000**

## Available Scripts

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Main page (renders ChatContainer)
│   └── globals.css     # Global styles (Tailwind imports)
├── components/
│   ├── ChatContainer.tsx    # Main container with state management
│   ├── ChatInput.tsx        # Text input and submit button
│   ├── ResponseDisplay.tsx  # Query and response display
│   └── ErrorMessage.tsx     # Error message display
├── types/
│   └── chat.ts         # TypeScript interfaces
├── lib/
│   └── validation.ts   # Input validation logic
└── public/             # Static assets
```

## Features

- Text input for user queries
- Submit button (supports Enter key)
- Response display section
- Input validation (1-1000 characters)
- Error handling with dismissible messages
- Responsive design (mobile, tablet, desktop)
- Accessible UI with ARIA labels
- Clean, intuitive interface

## Configuration

### Environment Variables

Configuration is managed via `.env.local`:

```env
# Frontend Port
PORT=3000

# Backend API URL (required for API integration)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important**: `NEXT_PUBLIC_API_URL` must start with `NEXT_PUBLIC_` to be accessible in the browser.

**Default Backend**: If `NEXT_PUBLIC_API_URL` is not set, the app defaults to:
```
https://huggingface.co/spaces/shumailaaijaz/hackathon-book
```

### Backend Switching

**For local development** (with local backend):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**For production** (with Hugging Face Spaces backend):
```env
# Omit NEXT_PUBLIC_API_URL or set it to the HF Spaces URL
NEXT_PUBLIC_API_URL=https://huggingface.co/spaces/shumailaaijaz/hackathon-book
```

**After changing environment variables**, restart the dev server:
```bash
npm run dev
```

## API Integration

### Backend API Contract

The frontend integrates with a FastAPI RAG backend hosted on Hugging Face Spaces.

**Endpoint**: `POST /query`

**Request**:
```json
{
  "query": "What is Physical AI?"
}
```

**Response**:
```json
{
  "answer": "Physical AI refers to embodied artificial intelligence systems...",
  "citations": [
    {
      "chapter": "Chapter 1: Introduction to Physical AI",
      "section": "1.1 Defining Physical AI",
      "source_url": "https://shumailaaijaz.github.io/physical-ai-textbook/intro/physical-ai",
      "referenced_text": "Physical AI systems combine perception, reasoning, and actuation..."
    }
  ],
  "timestamp": 1703620800
}
```

### Error Handling

The app handles the following error types:

| Error Type | Trigger | User Message |
|------------|---------|--------------|
| Network | No internet or backend down | "Unable to connect to server. Please try again." |
| Timeout | Request >30s | "Request timed out. Please try again." |
| HTTP | 4xx/5xx status codes | "Server error. Please try again later." |
| Validation | Invalid response format | "Invalid response from server." |

All errors are dismissible and allow retrying.

### Testing the Integration

1. **Start the backend** (optional for local testing):
```bash
cd src/chatbot/backend
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

2. **Start the frontend**:
```bash
cd frontend
npm run dev
```

3. **Test query submission**:
- Open http://localhost:3000
- Type: "What is Physical AI?"
- Click Submit
- Verify: Response displays with citations within 10 seconds

### Troubleshooting

#### CORS Errors

**Error**: "Access to fetch at '...' has been blocked by CORS policy"

**Solution**: Backend must set CORS headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

#### Timeout Issues

**Error**: "Request timed out. Please try again."

**Possible Causes**:
- Backend is slow (>30s response)
- Network connectivity issues

**Solutions**:
- Check backend logs for slow queries
- Test backend directly with curl
- Verify network connection

#### Network Connection Errors

**Error**: "Unable to connect to server. Please try again."

**Possible Causes**:
- Backend not running (local)
- Hugging Face Spaces down
- Invalid `NEXT_PUBLIC_API_URL`

**Solutions**:
- Verify backend is running: `curl http://localhost:8000/query -X POST -H "Content-Type: application/json" -d '{"query":"test"}'`
- Check `.env.local` has correct URL (no trailing slash)
- Check browser console for detailed error messages

#### Environment Variable Not Working

**Symptoms**: Changes to `.env.local` not reflected

**Solutions**:
1. Restart dev server (Next.js doesn't hot-reload env vars)
2. Verify variable starts with `NEXT_PUBLIC_` (required for client-side)
3. Check for typos in variable name
4. Clear `.next` cache: `rm -rf .next && npm run dev`

### API Documentation

For full API specification and testing scenarios, see:
- [API Contract](../specs/006-frontend-backend-integration/contracts/backend-api.md)
- [Quickstart Guide](../specs/006-frontend-backend-integration/quickstart.md)

## Development Notes

- TypeScript strict mode is enabled
- Path alias `@/*` maps to root directory
- No external state management library (uses React useState)
- Native fetch API with AbortController (no axios/ky dependencies)
- 30-second request timeout
- Response validation before rendering

## Browser Support

Tested on latest versions of:
- Chrome
- Firefox
- Safari
- Edge
