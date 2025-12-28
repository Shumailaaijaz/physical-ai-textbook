# 🗄️ Qdrant Setup & Textbook Ingestion Guide

Complete guide to set up Qdrant vector database and load your Physical AI textbook.

---

## Step 1: Create Qdrant Cloud Account (FREE)

### **1.1 Sign Up**

1. Go to: https://cloud.qdrant.io/signup
2. Sign up with GitHub or email
3. Verify your email

### **1.2 Create a Cluster**

1. Click **"Create Cluster"**
2. Choose **FREE tier** (1GB storage, perfect for textbook)
3. **Cluster Name:** `physical-ai-textbook`
4. **Region:** Choose closest to you
5. Click **"Create"**
6. Wait 2-3 minutes for cluster to spin up

### **1.3 Get Credentials**

Once cluster is running:

1. Click on your cluster name
2. Copy the **Cluster URL** (looks like: `https://xyz-abc123.us-east-1-0.aws.cloud.qdrant.io`)
3. Click **"API Keys"** tab
4. Click **"Generate API Key"**
5. **IMPORTANT:** Copy and save the API key (you can't see it again!)

---

## Step 2: Set Up Environment Variables

### **2.1 Create `.env` File in Backend**

Create `backend/.env` with:

```env
# Qdrant Configuration
QDRANT_URL=https://YOUR-CLUSTER-URL.aws.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key-here

# OpenAI for Embeddings (if using OpenAI)
OPENAI_API_KEY=your-openai-key-here

# OR use OpenRouter for everything
OPENROUTER_API_KEY=your-openrouter-key-here
```

**Replace** `YOUR-CLUSTER-URL` and API keys with your actual values.

---

## Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt

# If requirements.txt is missing packages, install manually:
pip install fastapi uvicorn python-dotenv
pip install langchain langchain-openai langchain-community
pip install qdrant-client
pip install unstructured markdown
```

---

## Step 4: Run Ingestion Script

This loads all your textbook chapters into Qdrant.

### **4.1 Verify Docs Folder**

```bash
# From backend directory
ls ../docs/*.mdx

# Should show:
# 00-preface.mdx
# 01-introduction-to-physical-ai.mdx
# 02-ros2-fundamentals.mdx
# ... etc
```

### **4.2 Run Ingestion**

```bash
cd backend
python ingest.py
```

**Expected Output:**
```
Starting document ingestion...
Loading document: ../docs/00-preface.mdx
Loading document: ../docs/01-introduction-to-physical-ai.mdx
...
Loaded 14 documents
Split into 350 text chunks
Creating new collection 'textbook_docs'
Adding documents to vector store...
Successfully ingested 350 document chunks into vector store
Ingestion completed successfully!
```

### **4.3 Verify in Qdrant Cloud**

1. Go to Qdrant Cloud dashboard
2. Click your cluster
3. Click **"Collections"**
4. You should see `textbook_docs` with ~350 vectors

---

## Step 5: Update HuggingFace Space

Your HuggingFace Space needs the REAL code instead of mock data.

### **5.1 Update Files on HuggingFace**

1. Go to: https://huggingface.co/spaces/shumailaaijaz/hackathon-book

2. Click **"Files"** tab

3. **Replace `api.py`** with your `backend/main.py`:
   - Click `api.py` → Edit
   - Delete all content
   - Paste content from `backend/main.py`
   - Commit changes

4. **Delete or update `retrieving.py`**:
   - This file returns mock data
   - Either delete it or update it to query Qdrant

### **5.2 Add Environment Variables**

1. Click **"Settings"** tab
2. Scroll to **"Repository secrets"**
3. Add these secrets:

```
QDRANT_URL = https://YOUR-CLUSTER-URL.aws.cloud.qdrant.io
QDRANT_API_KEY = your-qdrant-api-key
OPENAI_API_KEY = your-openai-key (for embeddings)
OPENROUTER_API_KEY = your-openrouter-key (for LLM)
```

4. Click **"Save"** for each

### **5.3 Update `requirements.txt`**

Make sure HuggingFace Space has:

```txt
fastapi
uvicorn
python-dotenv
langchain
langchain-openai
langchain-community
qdrant-client
pydantic
requests
```

---

## Step 6: Test the Backend

### **6.1 Wait for HuggingFace Rebuild**

After updating files, HuggingFace will rebuild (2-3 min).

Watch the build log for errors.

### **6.2 Test API Endpoint**

```bash
curl -X POST https://shumailaaijaz-hackathon-book.hf.space/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is ROS 2?"}'
```

**Expected Response:**
```json
{
  "answer": "ROS 2 (Robot Operating System 2) is the next generation...",
  "sources": ["02-ros2-fundamentals.mdx"],
  "status": "success"
}
```

**NOT:**
```json
{
  "content": "Sample document content..."  // ❌ This is mock data
}
```

---

## Step 7: Test End-to-End

### **7.1 Test on Your Site**

1. Go to: https://shumailaaijaz.github.io/physical-ai-textbook/
2. Click the 💬 button
3. Ask: **"What is ROS 2?"**
4. You should get real content from Chapter 2!

### **7.2 Expected Behavior**

```
Question: What is ROS 2?

Answer: ROS 2 (Robot Operating System 2) is the next generation
of the Robot Operating System framework. It provides tools,
libraries, and conventions for building robot applications...

Sources: Chapter 2: ROS 2 Fundamentals
```

---

## Troubleshooting

### **Issue: "Collection not found"**

- Run `ingest.py` again
- Check Qdrant dashboard to verify collection exists

### **Issue: "OpenAI API key not found"**

- Add `OPENAI_API_KEY` to HuggingFace secrets
- OR modify code to use OpenRouter embeddings

### **Issue: "Still getting mock data"**

- Check HuggingFace Space is using updated `api.py`
- Verify `QDRANT_URL` and `QDRANT_API_KEY` are set correctly
- Check build logs for errors

### **Issue: "Timeout errors"**

- Qdrant free tier might be slow on first query (cold start)
- Try again, subsequent queries will be faster

---

## Architecture After Setup

```
Student Question
      ↓
GitHub Pages Site
      ↓
Vercel Chatbot Frontend
      ↓
HuggingFace Backend (FastAPI)
      ↓
Qdrant Vector Database ✅
      ↓
Retrieve Relevant Chunks
      ↓
OpenRouter LLM (Generate Answer)
      ↓
Return Answer + Sources
```

---

## Quick Reference

**Qdrant Dashboard:** https://cloud.qdrant.io/

**HuggingFace Space:** https://huggingface.co/spaces/shumailaaijaz/hackathon-book

**Collection Name:** `textbook_docs`

**Embedding Model:** `text-embedding-3-small` (OpenAI)

**Vector Size:** 1536 dimensions

**Chunk Size:** 1000 characters

**Overlap:** 200 characters

---

## Next Steps

1. ✅ Create Qdrant account
2. ✅ Get API credentials
3. ✅ Run `ingest.py` to load textbook
4. ✅ Update HuggingFace Space code
5. ✅ Add environment variables
6. ✅ Test end-to-end

**After completion, your students will get real AI-powered answers from your textbook!** 🎓🤖
