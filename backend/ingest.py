import os
import glob
from pathlib import Path
from dotenv import load_dotenv
import logging
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient, models

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def load_documents_from_docs_folder():
    """Load all markdown files from the /docs folder"""
    docs_path = Path("../docs")  # Relative to backend folder
    if not docs_path.exists():
        logger.error(f"Docs folder not found at {docs_path.absolute()}")
        return []

    # Find all markdown files in docs and subdirectories
    md_files = list(docs_path.rglob("*.md")) + list(docs_path.rglob("*.mdx"))

    documents = []
    for file_path in md_files:
        print(f"Loading document: {file_path}")
        try:
            loader = UnstructuredMarkdownLoader(str(file_path))
            docs = loader.load()
            # Add source metadata
            for doc in docs:
                doc.metadata["source"] = str(file_path.relative_to("../docs"))
                doc.metadata["filename"] = file_path.name
            documents.extend(docs)
        except Exception as e:
            print(f"Error loading {file_path}: {e}")

    return documents

def ingest_documents():
    """Ingest documents from /docs folder into Qdrant vector store"""
    print("Starting document ingestion...")

    # Load documents
    documents = load_documents_from_docs_folder()
    print(f"Loaded {len(documents)} documents")

    if not documents:
        print("No documents found to ingest. Please make sure you have markdown files in the /docs folder.")
        return

    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )

    texts = text_splitter.split_documents(documents)
    print(f"Split into {len(texts)} text chunks")

    # Initialize embeddings
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    # Initialize Qdrant client
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if qdrant_api_key:
        qdrant_client = QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key
        )
    else:
        qdrant_client = QdrantClient(host="localhost", port=6333)

    # Create collection if it doesn't exist
    try:
        qdrant_client.get_collection("textbook_docs")
        print("Collection 'textbook_docs' already exists, will be reused")
    except:
        print("Creating new collection 'textbook_docs'")
        qdrant_client.create_collection(
            collection_name="textbook_docs",
            vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE),
        )

    # Add documents to vector store
    print("Adding documents to vector store...")
    vector_store = Qdrant(
        client=qdrant_client,
        collection_name="textbook_docs",
        embeddings=embeddings,
    )

    vector_store.add_documents(texts)
    print(f"Successfully ingested {len(texts)} document chunks into vector store")
    print("Ingestion completed successfully!")

if __name__ == "__main__":
    ingest_documents()