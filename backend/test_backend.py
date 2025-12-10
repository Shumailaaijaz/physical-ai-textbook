import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("Testing backend dependencies...")

try:
    import fastapi
    print("[OK] FastAPI imported successfully")

    import uvicorn
    print("[OK] Uvicorn imported successfully")

    import qdrant_client
    print("[OK] Qdrant client imported successfully")

    from langchain_community.vectorstores import Qdrant
    print("[OK] LangChain Qdrant integration imported successfully")

    from langchain_openai import OpenAIEmbeddings
    print("[OK] OpenAI embeddings imported successfully")

    from langchain_community.chat_models import ChatLiteLLM
    print("[OK] LiteLLM chat model imported successfully")

    import os
    print("[OK] OS module imported successfully")

    print("\nAll required dependencies are available!")
    print("\nEnvironment variables check:")
    print(f"QDRANT_URL: {'SET' if os.getenv('QDRANT_URL') else 'NOT SET'}")
    print(f"OPENAI_API_KEY: {'SET' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
    print(f"LITELLM_API_KEY: {'SET' if os.getenv('LITELLM_API_KEY') else 'NOT SET'}")

except ImportError as e:
    print(f"[ERROR] Import error: {e}")