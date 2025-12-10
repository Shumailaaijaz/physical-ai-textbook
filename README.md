# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Project Structure

This project consists of:
- **Frontend** (`/`): Docusaurus-based website with integrated chatbot
- **Backend** (`/backend`): Python-based RAG API server using FastAPI and LangChain
- **API** (`/api`): Additional API endpoints
- **Server** (`/server`): Node.js/Express server for other services

## Chatbot Integration

The website includes an AI-powered chatbot that uses RAG (Retrieval-Augmented Generation) to answer questions about the Physical AI textbook content. The chatbot is integrated as a floating action button that appears on all pages.

## Running the Full Application

1. **Frontend**:
   ```bash
   yarn start
   ```

2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   # Make sure to set up your .env file first
   python main.py
   # or: uvicorn main:app --host 0.0.0.0 --port 8000
   ```

3. **Ingest Textbook Content** (run once after setup):
   ```bash
   cd backend
   python ingest.py
   ```

The chatbot page will be available at `/chatbot` and will connect to the backend API at `http://localhost:8000`. 
