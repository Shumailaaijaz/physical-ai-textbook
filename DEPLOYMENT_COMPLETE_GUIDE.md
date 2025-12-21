# Complete Deployment Guide - Physical AI Website with Chatbot

## Current Status ✅

### Backend (Local)
- ✅ Running at http://localhost:8000
- ✅ Using OpenRouter API with Mistral model
- ✅ Encoding errors fixed
- ✅ Configured for Vercel deployment

### Frontend
- ✅ Built successfully in `build/` directory
- ✅ Ready for GitHub Pages deployment
- ✅ Chatbot component wrapped with BrowserOnly for SSR compatibility

## Deployment Steps

### Step 1: Deploy Backend to Vercel

1. **Open a terminal in the backend directory:**
   ```bash
   cd /mnt/d/nativ-ai-web/website/backend
   ```

2. **Login to Vercel:**
   ```bash
   npx vercel login
   ```
   - This will open a browser window
   - Log in with your Vercel account (or create one at https://vercel.com)

3. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```
   - Answer the prompts:
     - Set up and deploy? **Y**
     - Which scope? (select your account)
     - Link to existing project? **N**
     - Project name? **physical-ai-backend** (or your choice)
     - In which directory is your code located? **.** (current directory)

4. **Set Environment Variables:**

   After first deployment, add your API key:
   ```bash
   npx vercel env add OPENROUTER_API_KEY production
   ```
   Paste your API key: `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`

   Optional (for RAG functionality):
   ```bash
   npx vercel env add QDRANT_URL production
   npx vercel env add QDRANT_API_KEY production
   ```

5. **Deploy to Production:**
   ```bash
   npx vercel --prod
   ```

6. **Copy Your Deployment URL:**
   You'll get a URL like: `https://physical-ai-backend.vercel.app`
   **SAVE THIS URL** - you need it for the next step!

### Step 2: Update Frontend with Vercel Backend URL

1. **Open ChatWidget.js:**
   ```bash
   cd /mnt/d/nativ-ai-web/website
   ```

2. **Edit src/components/ChatWidget.js** and update line 14:
   ```javascript
   const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
     ? 'http://localhost:8000/chat'
     : 'https://YOUR-VERCEL-URL.vercel.app/chat';  // ← Replace with your Vercel URL
   ```

   Replace `YOUR-VERCEL-URL.vercel.app` with the URL from Step 1.

3. **Rebuild the frontend:**
   ```bash
   npm run build
   ```

### Step 3: Deploy Frontend to GitHub Pages

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Configure for Vercel backend deployment"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Wait for GitHub Actions:**
   - Go to https://github.com/Shumailaaijaz/physical-ai-textbook/actions
   - The deployment workflow will run automatically
   - Wait for it to complete (green checkmark)

4. **Access your site:**
   - Your site will be live at: https://shumailaaijaz.github.io/physical-ai-textbook/
   - The chatbot will use your Vercel backend

## Manual Deployment (Alternative to GitHub Actions)

If you prefer to deploy manually:

```bash
npm run deploy
```

This will build and push directly to the gh-pages branch.

## Testing Your Deployment

### Test Backend
```bash
curl https://YOUR-VERCEL-URL.vercel.app/health
```

Expected response:
```json
{"status":"healthy","rag_initialized":true}
```

### Test Chat Endpoint
```bash
curl -X POST https://YOUR-VERCEL-URL.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! What is AI?", "history": []}'
```

You should get a response with AI-generated content.

### Test Frontend
1. Go to https://shumailaaijaz.github.io/physical-ai-textbook/
2. Look for the floating chat button (bottom right)
3. Click it and send a message
4. You should get a response from the Mistral model via OpenRouter

## Troubleshooting

### Backend Issues

**Problem: "CORS error" in browser console**
- Solution: Update `main.py` line 24 to include your GitHub Pages domain:
  ```python
  allow_origins=[
      "https://shumailaaijaz.github.io",
      "http://localhost:3000"
  ],
  ```

**Problem: "Function timeout" on Vercel**
- Solution: Vercel free tier has 10s timeout. Upgrade plan or use simpler queries.

**Problem: "API key not found"**
- Solution: Ensure environment variables are set in Vercel dashboard:
  https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### Frontend Issues

**Problem: Chatbot button doesn't appear**
- Check browser console for errors (F12)
- Ensure the build completed successfully
- Clear browser cache

**Problem: Chat messages not sending**
- Check Network tab in browser DevTools (F12)
- Verify the API URL is correct in ChatWidget.js
- Test the backend URL directly with curl

## Files Modified/Created

### Backend Files:
- ✅ `backend/main.py` - Updated for Vercel serverless
- ✅ `backend/vercel.json` - Vercel configuration
- ✅ `backend/.vercelignore` - Exclude unnecessary files
- ✅ `backend/package.json` - Added for Vercel CLI
- ✅ `backend/.env` - Cleaned Unicode characters

### Frontend Files:
- ✅ `src/components/ChatWidget.js` - Environment-aware API URL
- ✅ `src/theme/Root.tsx` - Wrapped chat in BrowserOnly
- ✅ `build/` - Production build ready

## Quick Start (TL;DR)

```bash
# 1. Deploy backend
cd /mnt/d/nativ-ai-web/website/backend
npx vercel login
npx vercel
npx vercel env add OPENROUTER_API_KEY production
# (paste your API key)
npx vercel --prod
# (copy the URL)

# 2. Update frontend
cd /mnt/d/nativ-ai-web/website
# Edit src/components/ChatWidget.js - update API URL
npm run build

# 3. Deploy frontend
git add .
git commit -m "Deploy with Vercel backend"
git push origin main

# Done! Visit https://shumailaaijaz.github.io/physical-ai-textbook/
```

## Support

If you encounter any issues:
1. Check the Vercel logs: https://vercel.com/dashboard
2. Check GitHub Actions logs: https://github.com/Shumailaaijaz/physical-ai-textbook/actions
3. Review browser console errors (F12 → Console tab)
