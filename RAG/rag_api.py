from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import time
import chromadb
from sentence_transformers import SentenceTransformer

# --------------------------
# CONFIG
# --------------------------
EMBED_MODEL_NAME = "BAAI/bge-m3"
DB_DIR = "rag_vector_db"  # Relative to python/ directory
COLLECTION_NAME = "salon_kb"

# --------------------------
# SETUP
# --------------------------
app = FastAPI(title="Salon RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer(EMBED_MODEL_NAME)
client = chromadb.PersistentClient(path=DB_DIR)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"},
)

# --------------------------
# ROUTES
# --------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "collection": COLLECTION_NAME,
        "count": collection.count()
    }

@app.get("/rag/retrieve")
def retrieve(q: str, k: int = 3):
    t0 = time.perf_counter()

    qvec = model.encode([q]).tolist()

    res = collection.query(
        query_embeddings=qvec,
        n_results=k,
        include=["documents", "metadatas", "distances"],
    )

    latency = (time.perf_counter() - t0) * 1000

    return {
        "query": q,
        "k": k,
        "latency_ms": round(latency, 2),
        "results": [
            {
                "text": d,
                "metadata": m,
                "distance": float(dist),
            }
            for d, m, dist in zip(
                res["documents"][0],
                res["metadatas"][0],
                res["distances"][0],
            )
        ]
    }
