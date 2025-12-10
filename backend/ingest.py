"""
Textbook Ingestion Script (T008)
Loads Docusaurus .md files, chunks them with RecursiveCharacterTextSplitter, and uploads to Qdrant

Usage:
    python ingest.py

Requirements:
    - OPENAI_API_KEY in .env (for embeddings)
    - QDRANT_URL and QDRANT_API_KEY in .env
    - Textbook markdown files in ../../../docs/ directory

Chunk Configuration:
    - Size: 400 tokens (~300 words)
    - Overlap: 100 tokens (25%)
    - Separators: Double newline, newline, space
"""

import os
import sys
import logging
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
import tiktoken

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import LangChain components
try:
    from langchain.document_loaders import DirectoryLoader, TextLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_openai import OpenAIEmbeddings
    from langchain_community.vectorstores import Qdrant
    from qdrant_client import QdrantClient, models
except ImportError as e:
    logger.error(f"Missing required package: {e}")
    logger.error("Install with: pip install langchain langchain-openai langchain-community qdrant-client tiktoken")
    sys.exit(1)

# ============================================================================
# CONFIGURATION
# ============================================================================

DOCS_PATH = Path(__file__).parent.parent.parent / "docs"  # D:/nativ-ai-web/website/docs
COLLECTION_NAME = "textbook_chunks"
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSION = 1536
CHUNK_SIZE = 400  # tokens
CHUNK_OVERLAP = 100  # tokens
DISTANCE_METRIC = models.Distance.COSINE

# ============================================================================
# QDRANT SETUP
# ============================================================================

def create_qdrant_collection():
    """
    Create Qdrant collection if it doesn't exist
    Collection: textbook_chunks
    Vector size: 1536 (text-embedding-3-small)
    Distance: COSINE
    """
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if not qdrant_url or not qdrant_api_key:
        logger.error("QDRANT_URL and QDRANT_API_KEY must be set in .env file")
        sys.exit(1)

    logger.info(f"Connecting to Qdrant at {qdrant_url}")
    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

    # Check if collection exists
    try:
        collections = client.get_collections().collections
        collection_names = [c.name for c in collections]

        if COLLECTION_NAME in collection_names:
            logger.info(f"Collection '{COLLECTION_NAME}' already exists")
            # Optionally delete and recreate for fresh ingestion
            response = input(f"Delete and recreate collection '{COLLECTION_NAME}'? (y/n): ")
            if response.lower() == 'y':
                client.delete_collection(COLLECTION_NAME)
                logger.info(f"Deleted existing collection")

        # Create collection
        if COLLECTION_NAME not in collection_names or response.lower() == 'y':
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(
                    size=EMBEDDING_DIMENSION,
                    distance=DISTANCE_METRIC
                )
            )
            logger.info(f"Created collection '{COLLECTION_NAME}'")

    except Exception as e:
        logger.error(f"Error with Qdrant collection: {e}")
        sys.exit(1)

    return client

# ============================================================================
# DOCUMENT LOADING & CHUNKING
# ============================================================================

def load_markdown_documents() -> List[Any]:
    """
    Load all .md files from docs/ directory
    Returns: List of LangChain Document objects
    """
    if not DOCS_PATH.exists():
        logger.error(f"Docs path not found: {DOCS_PATH}")
        logger.error(f"Current directory: {Path.cwd()}")
        logger.error("Please ensure textbook markdown files are in docs/ directory")
        sys.exit(1)

    logger.info(f"Loading markdown files from {DOCS_PATH}")

    # Use DirectoryLoader to load all .md files
    loader = DirectoryLoader(
        str(DOCS_PATH),
        glob="**/*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
        show_progress=True,
        use_multithreading=True
    )

    try:
        documents = loader.load()
        logger.info(f"Loaded {len(documents)} markdown files")
    except Exception as e:
        logger.error(f"Error loading documents: {e}")
        sys.exit(1)

    return documents

def chunk_documents(documents: List[Any]) -> List[Any]:
    """
    Split documents into chunks using RecursiveCharacterTextSplitter
    Chunk size: 400 tokens (~300 words)
    Overlap: 100 tokens (25%)
    """
    logger.info(f"Chunking {len(documents)} documents")

    # Initialize tiktoken encoder for token counting
    encoding = tiktoken.get_encoding("cl100k_base")  # Used by text-embedding-3-small

    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=lambda text: len(encoding.encode(text)),
        separators=["\n\n", "\n", " ", ""],
        keep_separator=False
    )

    # Split documents
    chunks = text_splitter.split_documents(documents)

    logger.info(f"Created {len(chunks)} chunks")
    logger.info(f"  Chunk size: {CHUNK_SIZE} tokens")
    logger.info(f"  Overlap: {CHUNK_OVERLAP} tokens")

    return chunks

def extract_metadata(chunk: Any) -> Dict[str, Any]:
    """
    Extract metadata from chunk for better search
    Metadata includes: chapter, section, source_file
    """
    metadata = chunk.metadata.copy()

    # Extract chapter and section from file path
    source = metadata.get("source", "")

    # Example: docs/chapter-3/kinematics.md -> chapter=3, section="kinematics"
    if "chapter" in source.lower():
        try:
            # Extract chapter number
            parts = source.lower().split("chapter-")
            if len(parts) > 1:
                chapter_num = int(parts[1].split("/")[0].split("\\")[0])
                metadata["chapter"] = chapter_num
        except:
            metadata["chapter"] = 0
    else:
        metadata["chapter"] = 0

    # Extract section name from filename
    try:
        filename = Path(source).stem  # e.g., "kinematics"
        metadata["section"] = filename
    except:
        metadata["section"] = "unknown"

    # Add source file path (relative to docs)
    try:
        metadata["source_file"] = str(Path(source))
    except:
        metadata["source_file"] = "unknown"

    return metadata

# ============================================================================
# QDRANT INGESTION
# ============================================================================

def ingest_to_qdrant(chunks: List[Any], client: QdrantClient):
    """
    Upload chunks to Qdrant with embeddings
    Uses LangChain's Qdrant integration for automatic embedding
    """
    logger.info("Initializing embeddings model")

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        logger.error("OPENAI_API_KEY must be set in .env file")
        sys.exit(1)

    # Initialize OpenAI embeddings
    embeddings = OpenAIEmbeddings(
        model=EMBEDDING_MODEL,
        openai_api_key=openai_api_key
    )

    # Enhance metadata for all chunks
    logger.info("Extracting metadata from chunks...")
    for i, chunk in enumerate(chunks):
        chunk.metadata = extract_metadata(chunk)
        if (i + 1) % 100 == 0:
            logger.info(f"  Processed {i + 1}/{len(chunks)} chunks")

    logger.info(f"Uploading {len(chunks)} chunks to Qdrant...")
    logger.info(f"  Collection: {COLLECTION_NAME}")
    logger.info(f"  Embedding model: {EMBEDDING_MODEL}")
    logger.info("  This may take several minutes...")

    # Use LangChain's Qdrant.from_documents for batch upload
    try:
        vector_store = Qdrant.from_documents(
            chunks,
            embeddings,
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY"),
            collection_name=COLLECTION_NAME,
            force_recreate=False  # Don't delete existing collection
        )
        logger.info("Successfully uploaded chunks to Qdrant")
    except Exception as e:
        logger.error(f"Error uploading to Qdrant: {e}")
        sys.exit(1)

    # Verify upload
    try:
        collection_info = client.get_collection(COLLECTION_NAME)
        logger.info(f"  Total vectors in collection: {collection_info.vectors_count}")
    except Exception as e:
        logger.warning(f"Could not verify upload: {e}")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main ingestion pipeline"""
    logger.info("=" * 70)
    logger.info("TEXTBOOK INGESTION PIPELINE")
    logger.info("=" * 70)

    # Step 1: Create Qdrant collection
    logger.info("\n[1/4] Setting up Qdrant collection...")
    client = create_qdrant_collection()

    # Step 2: Load markdown documents
    logger.info("\n[2/4] Loading markdown documents...")
    documents = load_markdown_documents()

    if len(documents) == 0:
        logger.error("No documents found! Exiting...")
        sys.exit(1)

    # Step 3: Chunk documents
    logger.info("\n[3/4] Chunking documents...")
    chunks = chunk_documents(documents)

    # Step 4: Upload to Qdrant
    logger.info("\n[4/4] Uploading to Qdrant...")
    ingest_to_qdrant(chunks, client)

    logger.info("\n" + "=" * 70)
    logger.info("INGESTION COMPLETE!")
    logger.info("=" * 70)
    logger.info(f"Documents processed: {len(documents)}")
    logger.info(f"Chunks created: {len(chunks)}")
    logger.info(f"Collection: {COLLECTION_NAME}")
    logger.info(f"Qdrant URL: {os.getenv('QDRANT_URL')}")
    logger.info("=" * 70)

if __name__ == "__main__":
    main()
