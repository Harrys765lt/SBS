# =======================
# RAG INGEST SCRIPT
# =======================

import csv
import os
import chromadb
from sentence_transformers import SentenceTransformer
import shutil

# ----------------------------------
# CONFIG
# ----------------------------------
EMBED_MODEL_NAME = "BAAI/bge-m3"
DB_DIR = "rag_vector_db"
COLLECTION_NAME = "salon_kb"

SERVICES_FILE = "services_full_with_desc.csv"   # <-- IMPORTANT: use new file
FAQ_FILE = "salon_kb_faq.csv"
HOURS_FILE = "salon_kb_hours.csv"
STAFF_FILE = "salon_kb_staffs.csv"
POLICIES_FILE = "policies.csv"

# ----------------------------------
# CLEAN START — DELETE OLD DB
# ----------------------------------
if os.path.exists(DB_DIR):
    shutil.rmtree(DB_DIR)
    print(f"🧹 Removed old DB folder: {DB_DIR}")

# ----------------------------------
# INIT EMBED MODEL
# ----------------------------------
print(f"📌 Loading embedding model: {EMBED_MODEL_NAME}")
model = SentenceTransformer(EMBED_MODEL_NAME)

# ----------------------------------
# INIT CHROMA
# ----------------------------------
client = chromadb.PersistentClient(path=DB_DIR)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)

# ----------------------------------
# EMBEDDING HELPER
# ----------------------------------
def embed(text):
    return model.encode([text])[0].tolist()

# ----------------------------------
# CLEAN CSV HELPER
# ----------------------------------
def clean_row(row):
    return {k.strip().lstrip("\ufeff"): (v.strip() if v else "") for k, v in row.items()}

# ----------------------------------
# INGEST SERVICES (using new description field)
# ----------------------------------
def ingest_services():
    print("\n📌 Ingesting services...")
    count = 0

    with open(SERVICES_FILE, encoding="utf-8") as f:
        reader = csv.DictReader(f)

        # Clean BOM headers
        reader.fieldnames = [h.strip().lstrip("\ufeff") for h in reader.fieldnames]

        for raw in reader:
            row = clean_row(raw)

            # ⭐ We embed the NEW description field
            description = row.get("description", "").strip()

            if not description:
                # Fallback if missing
                description = (
                    f"{row['name']} service. Price RM{row['price_rm']}, "
                    f"duration {row['duration_min']} minutes. {row['notes']}"
                )

            doc = f"[SERVICE]\n{description}"

            collection.add(
                ids=[f"svc_{count}"],
                documents=[doc],
                metadatas=row,      # full metadata for retrieval
                embeddings=[embed(doc)]
            )

            count += 1

    print(f"✓ Loaded {count} services.")
    return count

# ----------------------------------
# INGEST FAQ
# ----------------------------------
def ingest_faq():
    print("\n📌 Ingesting FAQ...")
    count = 0

    with open(FAQ_FILE, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        reader.fieldnames = [h.strip().lstrip("\ufeff") for h in reader.fieldnames]

        for raw in reader:
            row = clean_row(raw)

            faq_id = row["faq_id"]  # USE the true FAQ ID

            doc = (
                f"[FAQ]\n"
                f"Q: {row['question']}\n"
                f"A: {row['answer']}"
            )

            collection.add(
                ids=[faq_id],
                documents=[doc],
                metadatas=[{
                    "type": "faq",
                    "faq_id": faq_id,
                    "category": row.get("category", "")
                }],
                embeddings=[embed(doc)]
            )

            count += 1

    print(f"✓ Loaded {count} FAQ entries.")
    return count

# ----------------------------------
# INGEST POLICIES
# ----------------------------------
def ingest_policies():
    print("\n📌 Ingesting policies...")
    count = 0

    with open(POLICIES_FILE, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        reader.fieldnames = [h.strip().lstrip("\ufeff") for h in reader.fieldnames]

        for raw in reader:
            row = clean_row(raw)

            doc = (
                f"[POLICY]\n"
                f"{row['title']}\n"
                f"{row['text']}\n"
                f"Category: {row['category']}\n"
                f"Scope: {row['scope']}"
            )

            collection.add(
                ids=[f"policy_{count}"],
                documents=[doc],
                metadatas=row,
                embeddings=[embed(doc)]
            )
            count += 1

    print(f"✓ Loaded {count} policies.")
    return count

# ----------------------------------
# GENERIC INGEST (Hours, Staff)
# ----------------------------------
def ingest_generic(filename, prefix):
    print(f"\n📌 Ingesting {prefix}...")
    count = 0

    with open(filename, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        reader.fieldnames = [h.strip().lstrip("\ufeff") for h in reader.fieldnames]

        for raw in reader:
            row = clean_row(raw)

            doc = f"[{prefix.upper()}]\n" + "\n".join([f"{k}: {v}" for k, v in row.items()])

            collection.add(
                ids=[f"{prefix}_{count}"],
                documents=[doc],
                metadatas=row,
                embeddings=[embed(doc)]
            )
            count += 1

    print(f"✓ Loaded {count} {prefix} rows.")
    return count

# ----------------------------------
# RUN ALL
# ----------------------------------
def ingest_all():
    print("\n🚀 Starting ingestion...")

    total = (
        ingest_services()
        + ingest_faq()
        + ingest_policies()
        + ingest_generic(HOURS_FILE, "hours")
        + ingest_generic(STAFF_FILE, "staff")
    )

    print("\n🎉 INGEST COMPLETE")
    print(f"Total records embedded: {total}")

if __name__ == "__main__":
    ingest_all()
