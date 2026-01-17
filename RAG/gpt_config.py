# gpt_config.py
import os

# ==========================
# API KEY + MODEL
# ==========================
# API key should be set via environment variable OPENAI_API_KEY
# Never commit API keys to git!
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o-mini"

# ==========================
# Augmentation Parameters
# ==========================
VARIANTS_PER_SEED = 5
MAX_COMPLETION_TOKENS = 120
CHUNK_SIZE = 50
MAX_CHUNKS = 1

# ==========================
# seeds.csv Column Mapping
# ==========================
SEED_COLUMNS = ["seed1", "seed2", "seed3", "seed4", "seed5"]
CATEGORY_COL = "category"
ITEM_COL = "item"
