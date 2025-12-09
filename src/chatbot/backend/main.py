import os
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware  # For frontend calls
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from qdrant_client import QdrantClient

load_dotenv()
app = FastAPI()

# CORS for Docusaurus frontend (local/dev)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
qdrant = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))
llm = ChatOpenAI(model="gpt-4o-mini")  # Or gpt-4o for better, but costlier

# Tool for retrieval
@tool
def retrieve_chunks(query: str) -> str:
    """Retrieve relevant book chunks for a query."""
    vector = embeddings.embed_query(query)
    results = qdrant.search(collection_name="book_chunks", query_vector=vector, limit=5)
    return "\n\n".join([hit.payload["text"] for hit in results])

# Agent prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant for questions about the book. Use the retrieve_chunks tool for general questions. If selected_text is provided, answer ONLY using that context."),
    ("human", "{input}"),
])

# OpenAI Agent (using tool-calling agent from LangChain, which wraps OpenAI's agentic features)
agent = create_tool_calling_agent(llm, [retrieve_chunks], prompt)
agent_executor = agent | {"input": RunnablePassthrough()}  # For execution

@app.get("/rag-chat")
async def rag_chat(query: str = Query(...), selected_text: str = Query(None)):
    if selected_text:
        # Limited to selected text (no retrieval)
        response = llm.invoke(f"Question: {query}\nContext (use only this): {selected_text}")
        return {"answer": response.content}
    else:
        # Full RAG with agent
        response = agent_executor.invoke({"input": query})
        return {"answer": response["output"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)