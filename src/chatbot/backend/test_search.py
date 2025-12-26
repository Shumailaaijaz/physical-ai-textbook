"""
Test Semantic Search Script

Tests semantic search functionality by querying the Qdrant collection.
Run this after ingestion to verify retrieval works correctly.
"""

import os
import sys
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient

def test_search():
    """Test semantic search on ingested textbook content."""

    # Load environment variables
    load_dotenv()

    cohere_api_key = os.getenv("COHERE_API_KEY")
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = "rag_embeddings"

    if not cohere_api_key or not qdrant_url or not qdrant_api_key:
        print("❌ Error: Missing API keys in .env file")
        print("Required: COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY")
        sys.exit(1)

    print("🔍 Testing Semantic Search")
    print("="*60)

    try:
        # Initialize clients
        co = cohere.Client(api_key=cohere_api_key)
        client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

        print("✅ Clients initialized")

        # Test queries
        queries = [
            "What are vector databases?",
            "How does reinforcement learning work?",
            "Explain neural networks"
        ]

        for query_idx, query in enumerate(queries, 1):
            print(f"\n{'─'*60}")
            print(f"Query {query_idx}: {query}")
            print(f"{'─'*60}\n")

            # Generate query embedding
            print("  🧮 Generating query embedding...")
            query_embedding = co.embed(
                texts=[query],
                model="embed-multilingual-v3.0",
                input_type="search_query",  # Different from search_document!
                embedding_types=["float"]
            ).embeddings.float[0]

            print(f"  ✅ Embedding generated ({len(query_embedding)} dimensions)")

            # Search Qdrant
            print("  🔎 Searching Qdrant...")
            results = client.query_points(
                collection_name=collection_name,
                query=query_embedding,
                limit=3,
                with_payload=True
            ).points

            print(f"  ✅ Found {len(results)} results\n")

            # Display results
            for idx, result in enumerate(results, 1):
                print(f"  Result {idx} (score: {result.score:.3f}):")
                print(f"    Chapter: {result.payload.get('chapter', 'N/A')}")
                print(f"    Section: {result.payload.get('section', 'N/A')}")
                print(f"    Source: {result.payload.get('source_url', 'N/A')}")
                print(f"    Text: {result.payload.get('text', '')[:200]}...")
                print()

        print(f"{'='*60}")
        print("✅ Search test complete!")
        print("\n💡 Observations:")
        print("   - Check if results are semantically relevant")
        print("   - Verify source attribution is present")
        print("   - Ensure scores are reasonable (>0.5 for good matches)")
        print("\n🎉 Ready for Phase 1: Query API implementation")

    except Exception as e:
        print(f"❌ Search test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    test_search()
