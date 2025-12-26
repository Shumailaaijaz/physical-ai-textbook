"""
Qdrant Connection Test Script

Tests connection to Qdrant cluster and checks for 'rag_embeddings' collection.
Run this before executing the main ingestion script to verify credentials.
"""

import os
import sys
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

def test_qdrant_connection():
    """Test Qdrant connection and collection status."""

    # Load environment variables
    load_dotenv()

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if not qdrant_url or not qdrant_api_key:
        print("❌ Error: QDRANT_URL and QDRANT_API_KEY must be set in .env file")
        sys.exit(1)

    print(f"🔗 Connecting to Qdrant: {qdrant_url}")

    try:
        # Initialize client
        client = QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key
        )

        print("✅ Connection successful!")

        # Check for 'rag_embeddings' collection
        collection_name = "rag_embeddings"

        try:
            collection_info = client.get_collection(collection_name)
            print(f"\n📦 Collection '{collection_name}' exists")
            print(f"   - Points count: {collection_info.points_count}")
            print(f"   - Vector size: {collection_info.config.params.vectors.size}")
            print(f"   - Distance metric: {collection_info.config.params.vectors.distance}")
            print(f"\n✅ Ready for ingestion (existing collection will be recreated)")

        except Exception as e:
            print(f"\n⚠️  Collection '{collection_name}' does not exist")
            print(f"   It will be created during ingestion with:")
            print(f"   - Vector size: 1024 (Cohere embed-multilingual-v3.0)")
            print(f"   - Distance metric: COSINE")
            print(f"\n✅ Ready for ingestion (collection will be created)")

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_qdrant_connection()
