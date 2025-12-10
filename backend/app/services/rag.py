"""
RAG Service Module
Provides RAG pipeline components for textbook Q&A

Components:
- OpenAI Embeddings (text-embedding-3-small)
- Qdrant Vector Store
- LangChain RetrievalQA Chain
- Citation Extraction

Usage:
    rag = RAGService()
    result = await rag.query("What is kinematics?")
"""

import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import LangChain components
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from qdrant_client import QdrantClient

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COLLECTION_NAME = "textbook_chunks"
EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL = "gpt-4o-mini"  # Using GPT-4o-mini for cost-effectiveness

# ============================================================================
# RAG SERVICE
# ============================================================================

class RAGService:
    """
    RAG Service for textbook Q&A

    Initializes:
    - OpenAI embeddings
    - Qdrant vector store
    - RetrievalQA chain

    Methods:
    - query(): Perform RAG query
    - extract_citations(): Extract citation metadata
    """

    def __init__(self):
        """Initialize RAG components"""
        logger.info("Initializing RAG Service...")

        # Validate environment variables
        if not QDRANT_URL or not QDRANT_API_KEY:
            raise ValueError("QDRANT_URL and QDRANT_API_KEY must be set in .env")
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY must be set in .env")

        # Initialize embeddings
        logger.info(f"Initializing OpenAI embeddings: {EMBEDDING_MODEL}")
        self.embeddings = OpenAIEmbeddings(
            model=EMBEDDING_MODEL,
            openai_api_key=OPENAI_API_KEY
        )

        # Initialize Qdrant client
        logger.info(f"Connecting to Qdrant at {QDRANT_URL}")
        self.qdrant_client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY
        )

        # Initialize Qdrant vector store
        logger.info(f"Initializing Qdrant vector store: {COLLECTION_NAME}")
        self.vector_store = Qdrant(
            client=self.qdrant_client,
            collection_name=COLLECTION_NAME,
            embeddings=self.embeddings
        )

        # Initialize LLM
        logger.info(f"Initializing LLM: {LLM_MODEL}")
        self.llm = ChatOpenAI(
            model=LLM_MODEL,
            openai_api_key=OPENAI_API_KEY,
            temperature=0.0,  # Deterministic for factual answers
            streaming=False  # We'll handle streaming separately
        )

        # Create custom prompt template
        self.prompt_template = PromptTemplate(
            template="""You are an expert AI tutor for Physical AI & Humanoid Robotics.
Answer the question based ONLY on the provided context from the textbook.

Context:
{context}

Question: {question}

Instructions:
- Provide clear, accurate answers based on the context
- If the context doesn't contain enough information, say so
- Use technical terms appropriately
- Be concise but complete
- Never make up information not in the context

Answer:""",
            input_variables=["context", "question"]
        )

        # Create RetrievalQA chain
        logger.info("Creating RetrievalQA chain...")
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",  # Combine all retrieved docs
            retriever=self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 5}  # Retrieve top 5 chunks
            ),
            return_source_documents=True,  # Return source chunks for citations
            chain_type_kwargs={"prompt": self.prompt_template}
        )

        logger.info("RAG Service initialized successfully")

    async def query(self, question: str) -> Dict[str, Any]:
        """
        Perform RAG query

        Args:
            question: User's question

        Returns:
            {
                "answer": str,
                "citations": List[Dict],
                "source_documents": List[Document]
            }
        """
        logger.info(f"RAG query: {question[:50]}...")

        try:
            # Execute RetrievalQA chain
            result = self.qa_chain({"query": question})

            # Extract answer and source documents
            answer = result["result"]
            source_docs = result["source_documents"]

            # Extract citations
            citations = self.extract_citations(source_docs)

            logger.info(f"RAG query completed - {len(citations)} citations")

            return {
                "answer": answer,
                "citations": citations,
                "source_documents": source_docs
            }

        except Exception as e:
            logger.error(f"Error in RAG query: {e}")
            raise

    def extract_citations(self, source_documents: List[Any]) -> List[Dict[str, Any]]:
        """
        Extract citation metadata from source documents

        Args:
            source_documents: List of LangChain Document objects

        Returns:
            List of citation dictionaries with:
            - chunk_id: Unique chunk identifier
            - chapter: Chapter number
            - section: Section name
            - url: Link to textbook page
            - similarity_score: Relevance score
            - preview_text: First 100 chars of chunk
        """
        citations = []

        for i, doc in enumerate(source_documents):
            metadata = doc.metadata
            content = doc.page_content

            # Extract metadata
            chapter = metadata.get("chapter", 0)
            section = metadata.get("section", "unknown")
            source_file = metadata.get("source_file", "unknown")

            # Generate URL (assuming Docusaurus structure)
            # Example: docs/chapter-3/kinematics.md -> /docs/chapter-3/kinematics
            url = self._generate_url(source_file, chapter, section)

            # Create citation
            citation = {
                "chunk_id": f"chunk_{i}_{chapter}_{section}",
                "chapter": chapter,
                "section": section,
                "url": url,
                "similarity_score": 1.0 - (i * 0.1),  # Approximate, decrease by rank
                "preview_text": content[:100] + "..." if len(content) > 100 else content
            }

            citations.append(citation)

        return citations

    def _generate_url(self, source_file: str, chapter: int, section: str) -> str:
        """
        Generate Docusaurus URL from file path

        Args:
            source_file: Source file path
            chapter: Chapter number
            section: Section name

        Returns:
            Docusaurus URL path
        """
        # Example: docs/chapter-3/kinematics.md -> /docs/chapter-3/kinematics
        if chapter > 0:
            return f"/docs/chapter-{chapter}/{section}"
        else:
            return f"/docs/{section}"

    async def query_stream(self, question: str):
        """
        Perform RAG query with streaming response

        Args:
            question: User's question

        Yields:
            Chunks of the answer as they're generated

        Note: This is a placeholder for Phase 3 implementation
        """
        # TODO: Implement streaming with LangChain's streaming callbacks
        raise NotImplementedError("Streaming not yet implemented")

# ============================================================================
# GLOBAL INSTANCE (Singleton)
# ============================================================================

_rag_service_instance: Optional[RAGService] = None

def get_rag_service() -> RAGService:
    """
    Get or create RAG service instance (singleton)

    Returns:
        RAGService instance
    """
    global _rag_service_instance

    if _rag_service_instance is None:
        _rag_service_instance = RAGService()

    return _rag_service_instance

# ============================================================================
# SELECTED-TEXT MODE (Phase 4)
# ============================================================================

async def query_selected_text(query: str, selected_text: str) -> str:
    """
    Answer question using ONLY the selected text (no vector search)

    Args:
        query: User's question
        selected_text: Selected text from textbook

    Returns:
        Answer based only on selected text

    Note: This is a placeholder for Phase 4 implementation
    """
    logger.info(f"Selected-text query: {query[:50]}... (text length: {len(selected_text)} chars)")

    # Initialize LLM
    llm = ChatOpenAI(
        model=LLM_MODEL,
        openai_api_key=OPENAI_API_KEY,
        temperature=0.0
    )

    # Create prompt
    prompt = f"""You are an expert AI tutor for Physical AI & Humanoid Robotics.
Answer the question based ONLY on the provided selected text.

Selected Text:
{selected_text}

Question: {query}

Instructions:
- Answer based ONLY on the selected text
- If the selected text doesn't contain the answer, say so explicitly
- Be concise and accurate
- Never make up information

Answer:"""

    # Generate answer
    try:
        response = llm.predict(prompt)
        logger.info("Selected-text query completed")
        return response
    except Exception as e:
        logger.error(f"Error in selected-text query: {e}")
        raise
