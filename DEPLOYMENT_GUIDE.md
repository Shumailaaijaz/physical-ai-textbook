# Deployment Guide for Physical AI Textbook Chatbot

This guide explains how to deploy the RAG chatbot backend and connect it to your GitHub Pages frontend.

## Architecture Overview

- **Frontend**: Hosted on GitHub Pages (static files only)
- **Backend**: Must be hosted on a platform that supports Python/FastAPI
- **Communication**: Frontend makes API calls to backend over HTTP

## Step 1: Deploy the Backend

### Option A: Deploy to Render.com (Recommended)

1. **Prepare your backend code**
   - Ensure your `/backend` directory contains:
     - `main.py` - FastAPI server
     - `ingest.py` - Document ingestion script
     - `requirements.txt` - Python dependencies
     - `render.yaml` - Render deployment configuration
     - `.env.example` - Environment variables template

2. **Set up Qdrant Vector Database**
   - Sign up for Qdrant Cloud at [https://qdrant.tech/](https://qdrant.tech/)
   - OR run Qdrant locally/docker (for development)
   - Get your Qdrant URL and API key

3. **Deploy to Render**
   - Create a GitHub repository with just your backend code
   - Connect your GitHub repo to Render
   - Render will automatically use the `render.yaml` file
   - Set environment variables in Render dashboard:
     - `QDRANT_URL`
     - `QDRANT_API_KEY`
     - `OPENAI_API_KEY`
     - `LITELLM_API_KEY`

4. **Ingest your textbook content**
   - After deployment, run the ingest script to populate your vector database
   - You can do this locally, pointing to your deployed Qdrant instance

### Option B: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy using Railway**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Set environment variables in Railway dashboard**

## Step 2: Update Frontend API URL

After deploying your backend, you'll get a URL like `https://your-app-name.onrender.com`.

Update the API call in `src/pages/chatbot.js`:

```javascript
// Change this line:
const response = await fetch('http://localhost:8000/chat', {

// To your deployed backend URL:
const response = await fetch('https://your-deployed-app-name.onrender.com/chat', {
```

## Step 3: Rebuild and Deploy Frontend

1. **Update the frontend code**
   ```bash
   # Update the API URL in src/pages/chatbot.js
   # Then build the site
   yarn build
   ```

2. **Deploy to GitHub Pages**
   - Push your updated code to GitHub
   - GitHub Actions will automatically deploy to GitHub Pages
   - OR manually run: `yarn deploy`

## Step 4: Test the Integration

1. Visit your GitHub Pages site
2. Navigate to `/chatbot`
3. The chatbot should now connect to your deployed backend
4. Ask questions about your textbook content

## Troubleshooting

### CORS Issues
If you get CORS errors, ensure your backend allows requests from your GitHub Pages domain:
```python
# In main.py, update CORS to include your GitHub Pages URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-username.github.io"],  # Your GitHub Pages URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Connection Issues
- Verify your backend is running and accessible
- Check that your API URL is correct in the frontend
- Ensure environment variables are properly set in your backend deployment

### Ingestion Issues
- Make sure your `/docs` folder contains markdown files
- Run `python ingest.py` after setting up your Qdrant instance
- Verify the vector database is populated

## Security Notes

- Never commit real API keys to version control
- Use environment variables for all sensitive information
- The `.env` file should be in your `.gitignore`
- Only `.env.example` should be committed with placeholder values

## Alternative: Local Testing

For local development and testing:
1. Run backend: `cd backend && python main.py`
2. Run frontend: `yarn start`
3. Chatbot will work at `http://localhost:3000/chatbot`