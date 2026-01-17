"""
Supervised intent + service_id classifier training.

Dataset: `semantic_variants_expanded.csv` (~100k rows)
Columns:
  - category: high-level category (e.g. service_price, booking, cancel, ...)
  - item:     fine-grained service/policy/faq id (e.g. svc_cold_perm_s, faq_opening_hours)
  - variant:  user-style message variant

This script trains two classifiers over SentenceTransformer embeddings:
  - intent: one of booking / rescheduling / cancellation / query_*
  - service_id: the fine-grained `item` label

Models are saved under `<repo_root>/classifier_models/`.
"""

from pathlib import Path

import joblib
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split


# ---------- Paths ----------
THIS_DIR = Path(__file__).resolve().parent          # .../data training
REPO_ROOT = THIS_DIR.parent                         # repo root
DATA_PATH = THIS_DIR / "semantic_variants_expanded.csv"
MODEL_DIR = REPO_ROOT / "classifier_models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ---------- 1) Load data ----------
print(f"Loading dataset from {DATA_PATH} ...")
df = pd.read_csv(DATA_PATH)

# Expect columns: variant (text), category, item
required_cols = {"variant", "category", "item"}
missing = required_cols - set(df.columns)
if missing:
    raise ValueError(f"Dataset is missing required columns: {missing}")

df = df.dropna(subset=["variant", "category", "item"])


# ---------- 2) Map category -> intent ----------
# Supports both the original synthetic categories and the ones you described
# in your dataset (e.g. 'faq', 'policy').
CATEGORY_TO_INTENT = {
    # price queries
    "service_price": "query_price",
    "price": "query_price",
    # policy queries
    "service_policy": "query_policy",
    "policy": "query_policy",
    "pol": "query_policy",
    # FAQ / general info
    "service_faq": "query_faq",
    "faq": "query_faq",
    # service detail questions
    "service_details": "query_service_details",
    "details": "query_service_details",
    # booking flows
    "booking": "booking",
    "book": "booking",
    "reschedule": "rescheduling",
    "cancel": "cancellation",
    "cancellation": "cancellation",
}

df["intent"] = df["category"].map(CATEGORY_TO_INTENT)

# Remove any rows where mapping failed
df = df.dropna(subset=["intent"])

texts = df["variant"].astype(str).tolist()
intents = df["intent"].astype(str).tolist()
service_ids = df["item"].astype(str).tolist()

unique_intents = sorted(set(intents))
if len(unique_intents) < 2:
    raise ValueError(
        f"Need at least 2 different intents to train; found only {unique_intents}. "
        f"Check CATEGORY_TO_INTENT or your dataset categories."
    )


# ---------- 3) Train/test split ----------
print("Creating train/test split...")
X_train, X_test, y_intent_train, y_intent_test, y_service_train, y_service_test = train_test_split(
    texts,
    intents,
    service_ids,
    test_size=0.2,
    random_state=42,
    stratify=intents,
)


# ---------- 4) Load SentenceTransformer model ----------
EMBEDDING_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
print(f"Loading embedding model: {EMBEDDING_MODEL_NAME} ...")
encoder = SentenceTransformer(EMBEDDING_MODEL_NAME)


# ---------- 5) Encode text into embeddings ----------
print("Encoding train texts...")
X_train_emb = encoder.encode(X_train, batch_size=64, show_progress_bar=True)
print("Encoding test texts...")
X_test_emb = encoder.encode(X_test, batch_size=64, show_progress_bar=True)


# ---------- 6) Train intent classifier ----------
print("Training intent classifier...")
intent_clf = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
)
intent_clf.fit(X_train_emb, y_intent_train)

print("=== Intent classification report ===")
y_intent_pred = intent_clf.predict(X_test_emb)
print(classification_report(y_intent_test, y_intent_pred))


# ---------- 7) Train service_id classifier ----------
print("Training service_id classifier...")
service_clf = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
)
service_clf.fit(X_train_emb, y_service_train)

print("=== Service ID classification report ===")
y_service_pred = service_clf.predict(X_test_emb)
print(classification_report(y_service_test, y_service_pred))


# ---------- 8) Save models and encoder ----------
intent_path = MODEL_DIR / "intent_classifier.pkl"
service_path = MODEL_DIR / "service_classifier.pkl"
embed_path = MODEL_DIR / "embedding_model"

print(f"Saving intent classifier to {intent_path}")
joblib.dump(intent_clf, intent_path)

print(f"Saving service_id classifier to {service_path}")
joblib.dump(service_clf, service_path)

print(f"Saving encoder to {embed_path}")
encoder.save(str(embed_path))  # saves to a folder

print("All models saved under:", MODEL_DIR)
