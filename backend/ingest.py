import os
from pathlib import Path
import logging
from dotenv import load_dotenv

from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant
from langchain_text_splitters import RecursiveCharacterTextSplitter


from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

COLLECTION_NAME = "textbook_docs"  # Your new collection
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
EMBEDDING_MODEL = "text-embedding-3-small"  # 1536 dims

def load_documents():
    docs_path = Path("../docs")
    if not docs_path.exists():
        logger.error(f"Docs folder not found at {docs_path.absolute()}")
        return []

    md_files = list(docs_path.rglob("*.md")) + list(docs_path.rglob("*.mdx"))
    documents = []
    for file in md_files:
        try:
            loader = UnstructuredMarkdownLoader(str(file))
            docs = loader.load()
            for doc in docs:
                doc.metadata["source"] = str(file.relative_to("../docs"))
                doc.metadata["filename"] = file.name
            documents.extend(docs)
            logger.info(f"Loaded {file.name}")
        except Exception as e:
            logger.error(f"Failed to load {file}: {e}")
    return documents

def ingest():
    logger.info("Starting clean ingestion...")

    documents = load_documents()
    if not documents:
        logger.warning("No documents found to ingest!")
        return

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len
    )
    texts = splitter.split_documents(documents)
    logger.info(f"Split into {len(texts)} chunks")

    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    qdrant_client = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api_key
    )

    # Create collection if not exists
    try:
        qdrant_client.get_collection(COLLECTION_NAME)
        logger.info(f"Collection '{COLLECTION_NAME}' already exists")
    except:
        logger.info(f"Creating collection '{COLLECTION_NAME}'")
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
        )

    vector_store = Qdrant(
        client=qdrant_client,
        collection_name=COLLECTION_NAME,
        embeddings=embeddings
    )

    vector_store.add_documents(texts)
    logger.info(f"Successfully ingested {len(texts)} chunks")

if __name__ == "__main__":
    ingest()
