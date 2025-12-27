# 🚀 Vercel Deployment Guide

This guide will help you deploy the Next.js chatbot to Vercel and integrate it with your GitHub Pages Docusaurus site.

## Architecture Overview

```
┌───────────────────────────────────────────┐
│  Students visit book site                 │
│  https://shumailaaijaz.github.io/...      │
│                                           │
│  ┌─────────────────────────────────┐     │
│  │  Floating 💬 button appears     │     │
│  │  (bottom-right corner)          │     │
│  └──────────────┬──────────────────┘     │
│                 │ Click opens             │
│                 ▼                         │
│  ┌─────────────────────────────────┐     │
│  │  Chatbot Modal with iframe      │     │
│  │  ┌───────────────────────────┐  │     │
│  │  │ Vercel chatbot loads here │  │     │
│  │  │ https://...vercel.app     │  │     │
│  │  └───────────────────────────┘  │     │
│  └─────────────────────────────────┘     │
└───────────────────────────────────────────┘
```

## Step 1: Deploy Frontend to Vercel

### Method A: Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Create New Project:**
   - Click "Add New" → "Project"
   - Import `Shumailaaijaz/physical-ai-textbook` repository

3. **Configure Build Settings:**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variable:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://shumailaaijaz-hackathon-book.hf.space
   ```

5. **Click "Deploy"**
   - Wait 2-3 minutes for deployment
   - Copy your deployment URL (e.g., `https://physical-ai-chatbot.vercel.app`)

### Method B: Vercel CLI (For Developers)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

## Step 2: Update Docusaurus Site Configuration

After getting your Vercel URL, update the integration:

### Option 1: Environment Variable (Recommended)

1. **Edit `.env.production` in project root:**
   ```env
   REACT_APP_VERCEL_CHATBOT_URL=https://your-actual-chatbot.vercel.app
   ```

2. **Update GitHub Actions workflow** (`.github/workflows/deploy.yml`):
   ```yaml
   - name: Build website
     run: npm run build
     env:
       NODE_ENV: production
       REACT_APP_VERCEL_CHATBOT_URL: https://your-actual-chatbot.vercel.app
   ```

### Option 2: Direct Update (Quick Test)

Edit `src/components/ChatbotWidget.tsx`:
```typescript
const vercelUrl = 'https://your-actual-chatbot.vercel.app';
```

## Step 3: Deploy Updated Book Site

```bash
# Commit changes
git add .
git commit -m "Integrate Vercel chatbot into Docusaurus site"

# Push to GitHub (triggers deployment)
git push origin main
```

Monitor deployment at: https://github.com/Shumailaaijaz/physical-ai-textbook/actions

## Step 4: Test Integration

1. **Wait for GitHub Pages deployment** (3-4 minutes)

2. **Visit your book site:**
   https://shumailaaijaz.github.io/physical-ai-textbook/

3. **Look for the floating chat button** (💬 bottom-right)

4. **Click to open chatbot**

5. **Test a question:**
   - "What is ROS 2?"
   - "Explain humanoid robotics"

## What Students Will See

### Before Clicking:
- Floating green chat button in bottom-right corner
- Hovering makes it slightly larger

### After Clicking:
```
┌────────────────────────────────────┐
│ AI Assistant                    ✕  │
├────────────────────────────────────┤
│                                    │
│ 💬 Physical AI Chatbot             │
│ Ask questions about Physical AI    │
│ and robotics                       │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ User: What is ROS 2?           │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ AI: ROS 2 is the Robot        │ │
│ │ Operating System...            │ │
│ │                                │ │
│ │ Sources: Chapter 2             │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Type your question...      [→] │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

## Troubleshooting

### Chatbot button doesn't appear
- Check browser console for errors
- Verify `Root.tsx` includes `<ChatbotWidget />`
- Clear browser cache

### Clicking button shows blank iframe
- Verify Vercel URL in `.env.production` or `ChatbotWidget.tsx`
- Check Vercel deployment is successful
- Test Vercel URL directly in browser

### "Unable to connect to server" error
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Verify backend HuggingFace Space is running
- Test backend: `curl -X POST https://shumailaaijaz-hackathon-book.hf.space/query -H "Content-Type: application/json" -d '{"query": "test"}'`

### Mobile layout issues
- ChatbotWidget has responsive CSS (full-screen on mobile)
- Test on actual mobile device or Chrome DevTools

## File Changes Summary

**Files created:**
- `frontend/vercel.json` - Vercel configuration
- `frontend/.env.production` - Production env vars
- `frontend/.vercelignore` - Files to ignore
- `src/components/ChatbotWidget.tsx` - Integration component

**Files modified:**
- `src/theme/Root.tsx` - Added ChatbotWidget
- `.env.production` - Added Vercel URL
- `.github/workflows/deploy.yml` - Added env var (optional)

## Next Steps

1. ✅ Frontend deployed to Vercel
2. ✅ Chatbot integrated into Docusaurus
3. ⏳ Test with students
4. ⏳ Monitor usage and feedback
5. ⏳ Iterate based on questions asked

## Custom Domain (Optional)

To use a custom domain for your chatbot:

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Add custom domain (e.g., `chatbot.yoursite.com`)

2. **Update DNS records** (in your domain provider):
   ```
   Type: CNAME
   Name: chatbot
   Value: cname.vercel-dns.com
   ```

3. **Update `.env.production`:**
   ```env
   REACT_APP_VERCEL_CHATBOT_URL=https://chatbot.yoursite.com
   ```

## Support

- **Vercel Issues:** https://vercel.com/support
- **GitHub Actions:** https://github.com/Shumailaaijaz/physical-ai-textbook/actions
- **Backend Status:** Check HuggingFace Space logs

Happy teaching! 🎓🤖
