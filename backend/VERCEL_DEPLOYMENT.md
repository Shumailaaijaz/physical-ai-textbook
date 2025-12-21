# Vercel Deployment Guide for Physical AI Backend

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed (already installed locally in this project)

## Step 1: Login to Vercel

```bash
npx vercel login
```

This will open a browser window for authentication. Follow the prompts to log in.

## Step 2: Set Environment Variables

You need to add your environment variables to Vercel. You can do this via the CLI or Vercel dashboard.

### Option A: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Create a new project or select your project
3. Go to Settings → Environment Variables
4. Add the following variables:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `QDRANT_URL`: Your Qdrant URL (optional)
   - `QDRANT_API_KEY`: Your Qdrant API key (optional)

### Option B: Via CLI
```bash
npx vercel env add OPENROUTER_API_KEY production
# Paste your API key when prompted

npx vercel env add QDRANT_URL production
# Paste your Qdrant URL when prompted (or leave empty)

npx vercel env add QDRANT_API_KEY production
# Paste your Qdrant API key when prompted (or leave empty)
```

## Step 3: Deploy to Vercel

### First Deployment
```bash
npx vercel
```

This will:
1. Prompt you to set up and configure your project
2. Ask for project name (you can use the default or customize)
3. Deploy to a preview URL

### Production Deployment
```bash
npx vercel --prod
```

Or use the npm script:
```bash
npm run deploy
```

## Step 4: Get Your Deployment URL

After deployment, Vercel will provide you with a URL like:
- Preview: `https://your-project-name-xxxxx.vercel.app`
- Production: `https://your-project-name.vercel.app`

Copy this URL - you'll need it to update the frontend configuration.

## Troubleshooting

### CORS Issues
The backend is configured to allow all origins (`allow_origins=["*"]`). For production, you should update this in `main.py` to only allow your GitHub Pages domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://shumailaaijaz.github.io",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Build Failures
If the build fails, check:
1. All dependencies are in `requirements.txt`
2. Environment variables are set correctly
3. Python version compatibility (Vercel uses Python 3.9 by default)

### Function Timeout
Vercel has a 10-second timeout for serverless functions on the free tier. If your RAG queries take longer, consider:
1. Upgrading to a paid plan
2. Optimizing your vector search
3. Using a different hosting service for the backend

## Monitoring

View logs and monitor your deployment at:
https://vercel.com/dashboard

## Updating Deployment

To update your backend after making changes:

```bash
git add .
git commit -m "Update backend"
npx vercel --prod
```

Or set up automatic deployments by connecting your GitHub repository to Vercel.
