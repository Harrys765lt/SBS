# Architecture Diagram: Improved Bot

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER                                │
│                     (WhatsApp Message)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WHATSAPP CLIENT                            │
│                        (wweb.js)                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       HANDLER.JS                                │
│  • Receives message                                             │
│  • Logs to database                                             │
│  • Calls NLU                                                    │
│  • Processes intent                                             │
│  • Sends response                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LLM_NLU.JS                                │
│  • Builds conversation history                                  │
│  • Fetches RAG context ────────────┐                            │
│  • Calls OpenAI GPT-4o-mini        │                            │
│  • Returns JSON (intent/entities)  │                            │
└────────────────────────────┬───────┴────────────────────────────┘
                             │       │
                             │       │
                    ┌────────┘       └────────┐
                    ▼                         ▼
    ┌───────────────────────────┐  ┌──────────────────────────┐
    │   OPENAI API              │  │  PYTHON RAG SERVICE      │
    │   (gpt-4o-mini)           │  │  (port 8000)             │
    │                           │  │                          │
    │  • System prompt          │  │  • Semantic search       │
    │  • Facts (services/staff) │  │  • Returns top 3 results │
    │  • RAG context            │  │  • FAQ + Policies        │
    │  • Conversation history   │  │                          │
    │                           │  └──────────┬───────────────┘
    │  Returns:                 │             │
    │  {                        │             │
    │    "intent": "faq",       │             ▼
    │    "entities": {},        │  ┌──────────────────────────┐
    │    "follow_up": "..."     │  │  CHROMA VECTOR DB        │
    │  }                        │  │  (rag_vector_db/)        │
    └───────────┬───────────────┘  │                          │
                │                  │  • Embedded FAQs         │
                │                  │  • Embedded policies     │
                │                  │  • Embedded services     │
                │                  │  • ~150 records          │
                │                  └──────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HANDLER.JS (continued)                       │
│                                                                 │
│  Intent Processing:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FAQ         → Send follow_up answer                     │   │
│  │ Smalltalk   → Send smalltalk_reply                      │   │
│  │ Make Booking→ Gather entities or create hold            │   │
│  │ Confirm     → Confirm pending booking                   │   │
│  │ Cancel      → Cancel confirmed booking                  │   │
│  │ Reschedule  → Create new hold, link to old             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Logs response to database                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WHATSAPP CLIENT                            │
│                   (sends response)                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER                                │
│                    (receives answer)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example

### Example: "what services do you offer and can I bring my dog?"

```
1. CUSTOMER sends message
   ↓
2. WWEB.JS receives message
   ↓
3. HANDLER.JS
   - Logs: "in" message to database
   - Fetches last 7 messages from history
   ↓
4. LLM_NLU.JS
   - Builds history array
   - Calls RAG service with query: "what services do you offer and can I bring my dog?"
   ↓
5. PYTHON RAG SERVICE
   - Embeds query
   - Searches Chroma vector DB
   - Returns top 3 results:
     (1) [FAQ] Services overview
     (2) [POLICY] Pet policy
     (3) [FAQ] Service menu
   ↓
6. LLM_NLU.JS (continued)
   - Builds system prompt with:
     * Bot personality
     * Current services/staff (Facts)
     * RAG context (3 results above)
     * Conversation history
   - Calls OpenAI GPT-4o-mini
   ↓
7. OPENAI API
   - Processes prompt
   - Returns JSON:
     {
       "intent": "faq",
       "entities": {},
       "confidence": 0.95,
       "follow_up": "We offer haircuts, coloring, keratin, rebonding, 
                     perms and more! Unfortunately we only allow service 
                     animals inside for hygiene reasons. Were you looking 
                     to book something?"
     }
   ↓
8. LLM_NLU.JS
   - Parses JSON
   - Returns to handler
   ↓
9. HANDLER.JS
   - Sees intent: "faq"
   - Extracts follow_up
   - Logs: "out" message to database
   - Returns response
   ↓
10. WWEB.JS sends to customer
    ↓
11. CUSTOMER receives helpful answer!
```

---

## Component Details

### 1. Handler.js (Main Orchestrator)

**Responsibilities:**
- Receive messages from WhatsApp
- Log all messages to database
- Call NLU for intent extraction
- Process intents (FAQ, booking, confirm, cancel, etc.)
- Send responses back to WhatsApp

**Key Functions:**
- `handleInboundMessage()` - Main entry point
- Intent routing logic
- Database queries (bookings, customers, logs)

---

### 2. LLM_NLU.js (Intelligence Layer)

**Responsibilities:**
- Build conversation context
- Fetch RAG context from Python service
- Call OpenAI API with complete prompt
- Parse JSON response
- Return structured NLU object

**Key Functions:**
- `extractNLU(history)` - Main NLU function
- `buildFacts()` - Get current services/staff
- RAG API call (fetch)
- JSON parsing with fallbacks

---

### 3. Python RAG Service (Knowledge Base)

**Responsibilities:**
- Semantic search over knowledge base
- Return relevant FAQ/policy items
- Fast retrieval (< 50ms typical)

**Endpoints:**
- `GET /health` - Check service status
- `GET /rag/retrieve?q=...&k=3` - Search knowledge base

**Data Sources:**
- `salon_kb_faq.csv` - 50+ FAQ entries
- `policies.csv` - 90+ policy rules
- `services_full_with_desc.csv` - Service descriptions

---

### 4. Chroma Vector DB (Storage)

**Responsibilities:**
- Store embedded documents
- Perform cosine similarity search
- Return top-k results

**Collections:**
- `salon_kb` - All knowledge base items

**Embedding Model:**
- `BAAI/bge-m3` - Multilingual, high quality

---

### 5. SQLite Database (Operational Data)

**Tables:**
- `bookings` - All appointments
- `customers` - Customer info
- `message_log` - Conversation history
- `services` - Available services
- `staff` - Stylist information
- `session_ctx` - Temporary booking context

---

## Before vs After Architecture

### Before: Rigid State Machine

```
Customer Message
    ↓
Handler checks exact keywords
    ↓
Hard-coded if/else logic
    ↓
    ├─ "book" → Booking flow
    ├─ "cancel" → Cancel flow
    ├─ "reschedule" → Reschedule flow
    └─ else → "Sorry, didn't catch that"
    ↓
Response (often generic/unhelpful)
```

**Problems:**
- ❌ No flexibility
- ❌ Can't handle variations
- ❌ No FAQ support
- ❌ Repetitive responses

---

### After: Intelligent LLM + RAG

```
Customer Message
    ↓
Handler calls LLM_NLU
    ↓
LLM_NLU fetches RAG context
    ↓
OpenAI processes with full context
    ↓
Returns structured intent + entities
    ↓
Handler routes based on intent
    ↓
    ├─ FAQ → Send LLM-crafted answer
    ├─ Booking → Gather entities or create hold
    ├─ Confirm → Confirm booking
    ├─ Cancel → Cancel booking
    └─ Unknown → Graceful fallback
    ↓
Response (natural, helpful, varied)
```

**Benefits:**
- ✅ Flexible and adaptive
- ✅ Handles variations naturally
- ✅ Full FAQ support via RAG
- ✅ Natural, varied responses
- ✅ Uses knowledge base creatively

---

## Technology Stack

### Backend (Node.js)
- **Runtime:** Node.js (ESM modules)
- **WhatsApp:** whatsapp-web.js
- **Database:** better-sqlite3
- **LLM:** OpenAI GPT-4o-mini
- **Date/Time:** dayjs with timezone support

### RAG Service (Python)
- **Framework:** FastAPI
- **Vector DB:** ChromaDB
- **Embeddings:** sentence-transformers (BAAI/bge-m3)
- **Server:** Uvicorn

### Data Storage
- **Operational:** SQLite (salon.db)
- **Knowledge Base:** Chroma vector DB
- **Logs:** message_log table

---

## Scalability Considerations

### Current Setup (Single Server)
```
┌─────────────────────────────────────┐
│  Server                             │
│  ├─ Node.js Bot (port 3000)         │
│  ├─ Python RAG (port 8000)          │
│  ├─ SQLite DB                       │
│  └─ Chroma Vector DB                │
└─────────────────────────────────────┘
```

**Good for:**
- Small to medium salons
- Up to ~1000 conversations/day
- Single WhatsApp number

---

### Future: Distributed Setup

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Node.js Bot │────▶│  RAG Service │────▶│  Vector DB   │
│  (multiple)  │     │  (load bal.) │     │  (dedicated) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                           │
       └───────────────────┬───────────────────────┘
                           ▼
                  ┌──────────────┐
                  │  PostgreSQL  │
                  │  (replicated)│
                  └──────────────┘
```

**For:**
- Multiple locations
- High volume (10k+ conversations/day)
- Multiple WhatsApp numbers

---

## Security Considerations

### Current Implementation
- ✅ API keys in `.env` (not committed)
- ✅ Database is local (not exposed)
- ✅ RAG service on localhost only
- ✅ No sensitive data in logs

### Production Recommendations
- 🔒 Use environment-specific API keys
- 🔒 Enable HTTPS for RAG service
- 🔒 Implement rate limiting
- 🔒 Add authentication to RAG endpoints
- 🔒 Regular backups of SQLite DB
- 🔒 Encrypt customer data at rest

---

## Monitoring & Debugging

### Key Log Points

**Handler.js:**
```javascript
console.log('[RX]', { from, body }); // Incoming message
console.log('[TX]', { to, body });   // Outgoing message
```

**LLM_NLU.js:**
```javascript
console.log('[LLM NLU] Processing:', userText);
console.log('[LLM NLU] Response:', response);
console.log('[LLM NLU] Parsed intent:', obj.intent);
```

**Python RAG:**
```python
# Access logs at http://localhost:8000/docs
# Health check: http://localhost:8000/health
```

### Database Queries

**Check recent conversations:**
```sql
SELECT * FROM message_log 
WHERE phone = '60102502292@c.us' 
ORDER BY id DESC LIMIT 20;
```

**Check RAG performance:**
```bash
curl "http://localhost:8000/rag/retrieve?q=pet+policy&k=3"
```

---

## Summary

Your bot now uses a **modern, intelligent architecture**:

1. **LLM-powered NLU** - Understands intent and entities
2. **RAG integration** - Uses knowledge base creatively
3. **Flexible routing** - Handles any conversation flow
4. **Data-driven** - Easy to update without code changes
5. **Maintainable** - Clear separation of concerns

This architecture enables your bot to be **agile, intelligent, and continuously improving**! 🎉

