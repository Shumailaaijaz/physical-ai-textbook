# 🚀 Deployment Instructions - Physical AI Website

## ✅ Configuration Updated!

I've automatically configured your project to work with both local development and production deployment.

## Current Status

- ✅ Backend configured for Vercel
- ✅ Frontend configured for GitHub Pages
- ✅ Environment detection setup
- ✅ Chat button fixed (SSR compatible)

---

## 📋 Deployment Steps

### Option 1: Deploy Backend to Vercel (Recommended)

Run these commands in your terminal:

```bash
# Navigate to backend directory
cd /mnt/d/nativ-ai-web/website/backend

# Login to Vercel (opens browser)
npx vercel login

# Deploy to Vercel
npx vercel

# Answer the prompts:
# ✓ Set up and deploy? Y
# ✓ Which scope? (select your account)
# ✓ Link to existing project? N
# ✓ Project name? physical-ai-backend
# ✓ Directory? . (just press Enter)

# Set environment variable
npx vercel env add OPENROUTER_API_KEY production
# When prompted, paste: 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

# Deploy to production
npx vercel --prod
```

**📝 Important:** Copy the deployment URL (e.g., `https://physical-ai-backend-xxxxx.vercel.app`)

### Update Backend URL

After getting your Vercel URL, update `.env.production`:

```bash
cd /mnt/d/nativ-ai-web/website

# Edit .env.production and replace the URL with your actual Vercel URL
nano .env.production
# or
code .env.production
```

Change this line:
```
REACT_APP_CHATBOT_API_URL=https://physical-ai-backend.vercel.app
```

To your actual URL:
```
REACT_APP_CHATBOT_API_URL=https://your-actual-url.vercel.app
```

---

### Option 2: Use Existing HuggingFace Backend (Quick Deploy)

If you want to deploy quickly without setting up Vercel:

Edit `.env.production`:
```bash
cd /mnt/d/nativ-ai-web/website
nano .env.production
```

Change to:
```
REACT_APP_CHATBOT_API_URL=https://shumailaaijaz-hackathon-book.hf.space/ask
```

---

## 🌐 Deploy Frontend to GitHub Pages

After configuring the backend URL:

```bash
cd /mnt/d/nativ-ai-web/website

# Rebuild with production config
npm run build

# Commit changes
git add .
git commit -m "Deploy chatbot with backend integration"

# Push to GitHub
git push origin main
```

GitHub Actions will automatically deploy to:
**https://shumailaaijaz.github.io/physical-ai-textbook/**

---

## 🧪 Testing

### Test Locally:

```bash
# Make sure backend is running
cd /mnt/d/nativ-ai-web/website/backend
source venv/bin/activate
python main.py &

# Serve the built site
cd /mnt/d/nativ-ai-web/website
npm run serve
```

Visit: http://localhost:3000/physical-ai-textbook/

### Test Production:

After deployment, visit: https://shumailaaijaz.github.io/physical-ai-textbook/

**You should see:**
- ✅ Blue floating chat button in bottom-right corner
- ✅ Click to open chat window
- ✅ Send messages and get AI responses

---

## 🔧 Troubleshooting

### Chat button not appearing?

1. Check browser console (F12) for errors
2. Verify the build completed successfully
3. Clear browser cache (Ctrl+Shift+R)

### Chat not responding?

1. Check Network tab in DevTools (F12)
2. Verify backend URL in `.env.production`
3. Test backend directly:
   ```bash
   curl https://YOUR-BACKEND-URL.vercel.app/health
   ```

### CORS errors?

Update `backend/main.py` line 24 to include your domain:
```python
allow_origins=[
    "https://shumailaaijaz.github.io",
    "http://localhost:3000"
],
```

Then redeploy backend:
```bash
cd backend
npx vercel --prod
```

---

## 📁 Files Created/Updated

- ✅ `src/config.ts` - Auto-detecting environment config
- ✅ `.env.local` - Local development settings
- ✅ `.env.production` - Production settings
- ✅ `backend/vercel.json` - Vercel configuration
- ✅ `src/chatbot/FloatingChatButton.tsx` - SSR fix applied

---

## 🎯 Quick Deploy Summary

**Fastest way to deploy:**

1. Use existing HuggingFace backend (skip Vercel for now)
2. Edit `.env.production` to use: `https://shumailaaijaz-hackathon-book.hf.space/ask`
3. Run: `npm run build && git add . && git commit -m "Deploy" && git push`
4. Wait 2-3 minutes for GitHub Actions
5. Visit: https://shumailaaijaz.github.io/physical-ai-textbook/

**OR deploy with new Vercel backend:**

1. Run: `cd backend && npx vercel login && npx vercel --prod`
2. Copy the URL and update `.env.production`
3. Run: `cd .. && npm run build && git add . && git commit -m "Deploy" && git push`
4. Visit: https://shumailaaijaz.github.io/physical-ai-textbook/

---

## ✨ Next Steps

After successful deployment:

1. Test the chatbot thoroughly
2. Share your site: https://shumailaaijaz.github.io/physical-ai-textbook/
3. Monitor Vercel logs if using Vercel backend
4. Customize chatbot responses if needed

Need help? Check the troubleshooting section above!
