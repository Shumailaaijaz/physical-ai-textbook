# Quickstart: Frontend ↔ Backend Integration

**Feature**: Frontend ↔ Backend Integration
**Date**: 2025-12-26
**Prerequisites**: Frontend already built (Next.js 14, TypeScript, Tailwind CSS)

## Setup

### 1. Environment Configuration

Create or update `frontend/.env.local`:

**For Local Backend Testing**:
```env
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**For HF Spaces Backend (Production)**:
```env
PORT=3000
# NEXT_PUBLIC_API_URL is optional - defaults to HF Spaces URL if not set
```

**Or omit `NEXT_PUBLIC_API_URL` entirely** - it will default to:
```
https://huggingface.co/spaces/shumailaaijaz/hackathon-book
```

### 2. Start Development Server

```bash
cd frontend
npm run dev
```

Frontend will be available at **http://localhost:3000**

### 3. Test Query Submission

1. Open http://localhost:3000 in browser
2. Type: "What is Physical AI?"
3. Click **Submit**
4. Verify: Response displays with citations within 10 seconds

##Development Workflow

### Local Backend + Local Frontend

**Terminal 1** (Backend):
```bash
cd src/chatbot/backend
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

**Environment**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Test**: Submit query → should hit local backend on port 8000

### HF Backend + Local Frontend

**Terminal 1** (Frontend only):
```bash
cd frontend
npm run dev
```

**Environment**:
```env
# No NEXT_PUBLIC_API_URL - uses HF Spaces default
```

**Test**: Submit query → should hit HF Spaces backend

## Testing Scenarios

### Test 1: Valid Query

**Input**: "What is Physical AI?"

**Expected**:
- Loading indicator shows ("Submitting...")
- Response appears within 10s
- Answer text displays in blue section
- Citations show chapter, section, URL

**Verify**:
- No console errors
- Response is readable
- Citations are clickable (if URLs provided)

### Test 2: Out-of-Scope Query

**Input**: "How do I train GPT models?"

**Expected**:
- Loading indicator shows
- Refusal message displays: "The provided book content does not contain sufficient information to answer this question."
- No citations shown (empty array)

**Verify**:
- No error state (this is a successful response, not an error)
- User can submit another query

### Test 3: Network Error

**Steps**:
1. Disconnect internet OR stop backend server
2. Submit query

**Expected**:
- Loading indicator shows
- Error message displays: "Unable to connect to server. Please try again."
- Error is dismissible (X button)

**Verify**:
- Error message appears in red box
- User can dismiss error
- User can submit new query after reconnecting

### Test 4: Timeout

**Steps**:
1. Set `NEXT_PUBLIC_API_URL` to slow/unresponsive endpoint
2. Submit query
3. Wait 30+ seconds

**Expected**:
- Loading indicator shows for 30s
- Error message displays: "Request timed out. Please try again."

**Verify**:
- Timeout happens after exactly 30s
- Error is dismissible

### Test 5: Backend Switching

**Steps**:
1. Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`
2. Restart dev server: `npm run dev`
3. Submit query
4. Check browser Network tab → verify request goes to localhost:8000
5. Remove `NEXT_PUBLIC_API_URL` from `.env.local`
6. Restart dev server
7. Submit query
8. Verify request goes to HF Spaces URL

**Verify**:
- No code changes required to switch backends
- Environment variable switch works correctly

## Troubleshooting

### Issue: "Unable to connect to server"

**Possible Causes**:
1. Backend not running (local) or HF Spaces down
2. CORS not configured on backend
3. Invalid `NEXT_PUBLIC_API_URL`

**Solutions**:
1. Verify backend is running: `curl http://localhost:8000/query -X POST -H "Content-Type: application/json" -d '{"query":"test"}'`
2. Check browser console for CORS errors
3. Verify `.env.local` has correct URL (no trailing slash)

### Issue: "Request timed out"

**Possible Causes**:
1. Backend is very slow (>30s response)
2. Network connectivity issues

**Solutions**:
1. Check backend logs for slow queries
2. Test backend directly with curl (time the response)
3. Verify network connection

### Issue: "Invalid response from server"

**Possible Causes**:
1. Backend returned malformed JSON
2. Missing required fields (`answer` or `citations`)

**Solutions**:
1. Check browser console for full error
2. Test backend with curl and verify JSON structure
3. Verify backend returns `{ answer: "...", citations: [...] }`

### Issue: CORS Error in Console

**Error Message**: "Access to fetch at '...' from origin 'http://localhost:3000' has been blocked by CORS policy"

**Cause**: Backend CORS not configured

**Solutions**:
1. Backend must set headers:
   ```
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```
2. Or use wildcard (development only): `Access-Control-Allow-Origin: *`
3. Contact backend administrator if HF Spaces CORS not configured

### Issue: Environment Variable Not Working

**Symptoms**: Changes to `.env.local` not reflected

**Solutions**:
1. **Restart dev server** - Next.js doesn't hot-reload env vars
2. Verify variable starts with `NEXT_PUBLIC_` (required for client-side)
3. Check for typos in variable name
4. Clear `.next` cache: `rm -rf .next && npm run dev`

## Production Deployment

### Build for Production

```bash
cd frontend
npm run build
```

**Verify**:
- Build completes without errors
- Check build output for bundle size
- No TypeScript errors

### Environment Variables

**Production Environment**:
```env
NEXT_PUBLIC_API_URL=https://huggingface.co/spaces/shumailaaijaz/hackathon-book
```

**Or omit entirely** - defaults to HF Spaces URL

### Deployment Checklist

- [ ] `NEXT_PUBLIC_API_URL` configured (or omitted for default)
- [ ] Backend CORS allows production domain
- [ ] Test query submission from production URL
- [ ] Verify error handling (disconnect network, test timeout)
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)

## API Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `https://huggingface.co/spaces/shumailaaijaz/hackathon-book` | Backend API base URL |
| `PORT` | No | 3000 | Frontend dev server port |

### Backend Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/query` | POST | Submit user query to RAG system |

See [contracts/backend-api.md](./contracts/backend-api.md) for full API specification.

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Implement `frontend/lib/api.ts` (API service)
3. Update `frontend/components/ChatContainer.tsx` (add API call)
4. Update `frontend/types/chat.ts` (add backend types)
5. Test all user stories and edge cases
6. Update `frontend/README.md` with integration docs

## Resources

- **Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Backend API Contract**: [contracts/backend-api.md](./contracts/backend-api.md)
- **Research**: [research.md](./research.md)
