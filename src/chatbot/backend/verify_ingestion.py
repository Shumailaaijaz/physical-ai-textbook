"""
Verify Ingestion Script

Checks the ingested data in Qdrant collection and displays sample chunks.
Run this after main.py completes to verify data quality.
"""

import os
import sys
from dotenv import load_dotenv
from qdrant_client import QdrantClient

def verify_ingestion():
    """Verify ingested data in Qdrant collection."""

    # Load environment variables
    load_dotenv()

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = "rag_embeddings"

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

        # Get collection info
        collection_info = client.get_collection(collection_name)
        total_points = collection_info.points_count

        print(f"\n📊 Collection Statistics")
        print(f"{'='*60}")
        print(f"Collection name: {collection_name}")
        print(f"Total points: {total_points:,}")
        print(f"Vector size: {collection_info.config.params.vectors.size}")
        print(f"Distance metric: {collection_info.config.params.vectors.distance}")
        print(f"{'='*60}\n")

        if total_points == 0:
            print("⚠️  No data found in collection. Run main.py to ingest content.")
            sys.exit(0)

        # Sample random points
        print("📝 Sample Chunks:\n")
        sample = client.scroll(
            collection_name=collection_name,
            limit=5,
            with_payload=True,
            with_vectors=False  # Don't fetch vectors (large)
        )[0]

        for idx, point in enumerate(sample, 1):
            print(f"{'─'*60}")
            print(f"Chunk {idx}:")
            print(f"  ID: {point.id}")
            print(f"  Source: {point.payload.get('source_url', 'N/A')}")
            print(f"  Chapter: {point.payload.get('chapter', 'N/A')}")
            print(f"  Section: {point.payload.get('section', 'N/A')}")
            print(f"  Chunk Index: {point.payload.get('chunk_index', 'N/A')}")
            print(f"  Token Count: {point.payload.get('token_count', 'N/A')}")
            print(f"  Text Preview: {point.payload.get('text', '')[:200]}...")
            print(f"  Timestamp: {point.payload.get('ingestion_timestamp', 'N/A')}")

        print(f"{'─'*60}\n")

        # Check for missing metadata
        missing_chapter = 0
        missing_section = 0

        sample_larger = client.scroll(
            collection_name=collection_name,
            limit=100,
            with_payload=True,
            with_vectors=False
        )[0]

        for point in sample_larger:
            if not point.payload.get('chapter'):
                missing_chapter += 1
            if not point.payload.get('section'):
                missing_section += 1

        print("🔍 Metadata Quality (sample of 100):")
        print(f"  Points with chapter: {100 - missing_chapter}/100 ({(100-missing_chapter)}%)")
        print(f"  Points with section: {100 - missing_section}/100 ({(100-missing_section)}%)")
        print()

        print("✅ Verification complete!")
        print(f"🎉 {total_points:,} chunks successfully ingested")
        print("\n💡 Next steps:")
        print("   - Run test_search.py to test semantic search")
        print("   - Check ingestion_checkpoint.json for processed URLs")

    except Exception as e:
        print(f"❌ Verification failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_ingestion()
