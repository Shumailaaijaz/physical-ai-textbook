# Physical AI Textbook RAG Backend

This backend provides a RAG (Retrieval-Augmented Generation) API for the Physical AI & Humanoid Robotics textbook. It uses FastAPI, LangChain, Qdrant, and Gemini to answer questions based on the textbook content.

## Prerequisites

- Python 3.9+
- Node.js and npm (for the Docusaurus frontend)

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your API keys:

- `QDRANT_URL`: URL for your Qdrant instance (default: `http://localhost:6333` for local)
- `QDRANT_API_KEY`: API key if using cloud Qdrant (leave empty for local)
- `OPENAI_API_KEY`: Your OpenAI API key for embeddings
- `LITELLM_API_KEY`: Your LiteLLM API key for Gemini access

### 3. Install and Run Qdrant (Local Option)

If you prefer to run Qdrant locally:

```bash
# Option 1: Using Docker
docker run -d -p 6333:6333 --name qdrant qdrant/qdrant

# Option 2: Download binary from https://github.com/qdrant/qdrant/releases
```

### 4. Ingest Textbook Content

Run the ingestion script to process all markdown files from the `/docs` folder:

```bash
python ingest.py
```

This will:
- Read all `.md` and `.mdx` files from the `/docs` folder
- Split them into chunks
- Generate embeddings
- Store them in Qdrant

## Running the Backend

Start the FastAPI server:

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

### API Endpoints

- `GET /` - Health check
- `GET /health` - Health status
- `POST /chat` - Chat endpoint that accepts a JSON with `message` field

Example request to `/chat`:
```json
{
  "message": "What is Physical AI?"
}
```

## Running the Frontend

From the project root directory:

```bash
# Install dependencies
npm install

# Start the Docusaurus development server
npm start
```

The frontend will be available at `http://localhost:3000`, and the chatbot page will be at `http://localhost:3000/chatbot`.

## Testing the Chatbot

1. Make sure the backend is running on `http://localhost:8000`
2. Make sure the frontend is running on `http://localhost:3000`
3. Navigate to `http://localhost:3000/chatbot`
4. Ask questions about your textbook content

## Troubleshooting

### Common Issues

1. **Connection Error**: Make sure both frontend and backend are running
2. **No Documents Found**: Ensure your textbook files are in the `/docs` folder
3. **Qdrant Connection**: Check that Qdrant is running and accessible
4. **API Keys**: Verify all required API keys are set in `.env`

### For Local Embeddings (Free Option)

If you want to use local embeddings instead of OpenAI, install additional packages:

```bash
pip install sentence-transformers
```

And modify the embeddings in `main.py` and `ingest.py`:

```python
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
```

## Architecture

- **FastAPI**: Web framework for the backend API
- **LangChain**: Framework for RAG implementation
- **Qdrant**: Vector database for storing document embeddings
- **Gemini**: LLM for generating responses via LiteLLM
- **Docusaurus**: Frontend framework with chatbot page

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| QDRANT_URL | Qdrant instance URL | http://localhost:6333 |
| QDRANT_API_KEY | Qdrant API key (for cloud) | - |
| OPENAI_API_KEY | OpenAI API key for embeddings | - |
| LITELLM_API_KEY | LiteLLM API key for Gemini | - |