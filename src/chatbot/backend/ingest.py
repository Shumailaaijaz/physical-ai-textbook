import os
from dotenv import load_dotenv
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from qdrant_client import QdrantClient, models
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import sessionmaker, declarative_base
import uuid

load_dotenv()

# Load all MD/MDX files from Docusaurus docs folder (adjust path)
loader = DirectoryLoader('../docs', glob="**/*.md", show_progress=True)  # Or '../src/pages' if using pages
documents = loader.load()

# Split into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(documents)

# Embeddings
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")  # Cheaper/faster than ada-002

# Qdrant setup
qdrant = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))
collection_name = "book_chunks"
if qdrant.has_collection(collection_name):
    qdrant.delete_collection(collection_name)
qdrant.create_collection(
    collection_name,
    vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)  # Dim for text-embedding-3-small
)

# Neon Postgres for metadata (chunk ID, text, source file/page)
Base = declarative_base()
engine = create_engine(os.getenv("NEON_DB_URL"))
Session = sessionmaker(bind=engine)

class ChunkMetadata(Base):
    __tablename__ = 'chunks'
    id = Column(String, primary_key=True)
    text = Column(String)
    source = Column(String)  # e.g., file name

Base.metadata.create_all(engine)

# Ingest to Qdrant and Neon
session = Session()
points = []
for chunk in chunks:
    vector = embeddings.embed_query(chunk.page_content)
    chunk_id = str(uuid.uuid4())
    points.append(models.PointStruct(
        id=chunk_id,
        vector=vector,
        payload={"text": chunk.page_content, "source": chunk.metadata.get("source", "unknown")}
    ))
    meta = ChunkMetadata(id=chunk_id, text=chunk.page_content, source=chunk.metadata.get("source", "unknown"))
    session.add(meta)

qdrant.upsert(collection_name, points=points)
session.commit()
print("Book content ingested!")