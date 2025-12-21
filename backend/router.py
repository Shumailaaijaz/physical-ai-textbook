import os
from dotenv import load_dotenv
from openai import OpenAI

# -------------------------------------------------
# Load environment variables
# -------------------------------------------------
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("https://openrouter.ai/api/v1/chat/completions")
OPENROUTER_MODEL = os.getenv("mistralai/devstral-2512:free")

assert OPENROUTER_API_KEY, "OPENROUTER_API_KEY missing"
assert OPENROUTER_BASE_URL, "OPENROUTER_BASE_URL missing"
assert OPENROUTER_MODEL, "OPENROUTER_MODEL missing"

# -------------------------------------------------
# OpenRouter Client (OpenAI-compatible)
# -------------------------------------------------
client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url=OPENROUTER_BASE_URL,
)

# -------------------------------------------------
# LLM Call Helper
# -------------------------------------------------
def call_llm(prompt: str) -> str:
    """
    Sends a prompt to OpenRouter and returns model output
    """
    response = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content
