import pandas as pd
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import os
from tqdm import tqdm

# ---------------------------
# 1. Setup
# ---------------------------
EMBED_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"  # better for BM+English
DATA_FILES = {
    "services": ["services_full.csv", "services_aliases_expanded.csv"],
    "faq": ["salon_kb_faq.csv"],
    "hours": ["salon_kb_hours.csv"],
    "policies": ["policies.csv"],
    "staffs": ["salon_kb_staffs.csv"],
}

OUTPUT_DIR = "chroma_store"


# ---------------------------
# 2. Load embedding model
# ---------------------------
print("Loading embedding model:", EMBED_MODEL_NAME)
embedder = SentenceTransformer(EMBED_MODEL_NAME)


# ---------------------------
# 3. Helper: clean NaN
# ---------------------------
def clean(x):
    if pd.isna(x):
        return ""
    return str(x).strip()


# ---------------------------
# 4. Build natural-language sentence for each service
# ---------------------------
def build_service_sentences(service_df, alias_df):
    """
    Merges services_full + services_aliases_expanded into clean fact sentences.
    """
    rows = []
    alias_map = {}

    # Build alias dict by service_id
    for _, row in alias_df.iterrows():
        sid = clean(row.get("service_id"))
        a1 = clean(row.get("alias_1"))
        a2 = clean(row.get("alias_2"))
        alias_map.setdefault(sid, set())
        if a1:
            alias_map[sid].add(a1)
        if a2:
            alias_map[sid].add(a2)

    # Build natural sentences
    for _, s in service_df.iterrows():
        sid = clean(s.get("service_id"))
        name = clean(s.get("name"))
        category = clean(s.get("category"))
        price = clean(s.get("price"))
        duration = clean(s.get("duration"))

        # Aliases
        aliases = alias_map.get(sid, [])
        alias_text = ""
        if aliases:
            alias_text = "Also known as: " + ", ".join(aliases) + "."

        # Build final fact sentence
        sentence = (
            f"{name} costs RM{price} and takes {duration} minutes. "
            f"Category: {category}. "
            f"{alias_text}"
        ).strip()

        rows.append(sentence)

    return rows


# ---------------------------
# 5. Ingest other CSVs as simple natural sentences
# ---------------------------
def build_generic_sentences(df):
    """
    Convert FAQ, policies, hours, staffs into simple readable sentences.
    """
    sentences = []
    for _, row in df.iterrows():
        text = " | ".join([f"{k}: {clean(v)}" for k, v in row.items()])
        sentences.append(text)
    return sentences


# ---------------------------
# 6. Main ingestion
# ---------------------------
def ingest_all():
    print("\n📌 Starting ingestion...")
    client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory=OUTPUT_DIR))

    if os.path.exists(OUTPUT_DIR):
        print("Clearing existing Chroma store...")
    collection = client.get_or_create_collection("salon_kb", embedding_function=None)

    # Clear old entries
    existing = collection.count()
    if existing > 0:
        print("Deleting old documents:", existing)
        collection.delete(where={})

    all_texts = []
    all_metadatas = []
    all_ids = []

    # ----------------------------
    # Process each knowledge type
    # ----------------------------
    for source, files in DATA_FILES.items():
        print(f"\n🔹 Processing {source}...")

        if source == "services":
            # Services: merge services_full + alias CSV
            service_df = pd.read_csv(files[0], encoding="utf-8")
            alias_df = pd.read_csv(files[1], encoding="utf-8")
            sentences = build_service_sentences(service_df, alias_df)

            for i, s in enumerate(sentences):
                all_texts.append(s)
                all_metadatas.append({"source": "services"})
                all_ids.append(f"services_{i}")

        else:
            # Generic CSVs (FAQs, hours, staff, policies)
            for f in files:
                df = pd.read_csv(f, encoding="utf-8")
                sentences = build_generic_sentences(df)
                for i, s in enumerate(sentences):
                    all_texts.append(s)
                    all_metadatas.append({"source": source})
                    all_ids.append(f"{source}_{f}_{i}")

    print("Embedding", len(all_texts), "documents...")

    embeddings = embedder.encode(all_texts, convert_to_numpy=True)

    print("Adding documents to Chroma...")
    collection.add(
        embeddings=list(embeddings),
        documents=all_texts,
        metadatas=all_metadatas,
        ids=all_ids,
    )

    print("\n🎉 Ingestion complete! Embeddings stored in:", OUTPUT_DIR)


if __name__ == "__main__":
    ingest_all()
