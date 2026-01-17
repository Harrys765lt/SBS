# Setup Guide: Improved Agile Bot

Your bot has been refactored to be more flexible, creative, and capable! Here's how to get it running.

---

## What Changed?

### ✅ Before (Rigid)
- 236-line state machine prompt
- Hard-coded responses
- Failed on multi-question messages
- Couldn't answer simple questions
- Repetitive phrasing

### ✅ After (Agile)
- Simplified, flexible prompt
- Uses knowledge base creatively
- Handles multiple questions at once
- Answers FAQs naturally
- Varied, human-like responses

---

## Quick Start

### 1. Ensure Python RAG Service is Running

The bot needs the RAG service to answer questions intelligently.

```bash
# Navigate to python module folder
cd "python module"

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the RAG API service
python -m uvicorn rag_api:app --reload --port 8000
```

Keep this terminal running. You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Verify RAG Data is Loaded

Check if the knowledge base has data:

```bash
# In a new terminal, test the health endpoint
curl http://localhost:8000/health
```

Expected output:
```json
{
  "status": "ok",
  "collection": "salon_kb",
  "count": 150  // or similar number
}
```

If `count` is 0 or very low, you need to ingest data:

```bash
cd "python module"
python rag_ingest.py
```

This will load:
- Services (from `services_full_with_desc.csv`)
- FAQs (from `salon_kb_faq.csv`)
- Policies (from `policies.csv`)
- Hours & Staff info

### 3. Start Your Bot

In a new terminal:

```bash
# From project root
npm start
```

### 4. Test the Improvements

Run the test script:

```bash
node test_bot_improvements.js
```

This will test:
- ✅ Multiple questions at once
- ✅ FAQ handling
- ✅ Booking flow
- ✅ Natural conversation

---

## Testing Manually

Send these test messages to your bot via WhatsApp:

### Test 1: Multiple Questions
```
hi what services do you guys provide and can i bring my dog into the store?
```

**Expected:** Bot answers both questions naturally:
- Lists services
- Explains pet policy
- Asks if you want to book

### Test 2: Booking with Question
```
I wanna book tomorrow, are you open?
```

**Expected:** Bot confirms hours and asks for service

### Test 3: Policy Question
```
can I cancel same day?
```

**Expected:** Bot explains 24-hour cancellation policy

### Test 4: Complete Booking
```
Hi I'm Rachel, book me a haircut Friday 3pm with Aida
```

**Expected:** Bot creates a hold immediately (all info provided)

---

## Updating Your Knowledge Base

### Adding New FAQs

Edit `python module/salon_kb_faq.csv`:

```csv
faq_id,question,answer
faq_new_question,Do you offer gift cards?,"Yes, gift cards are available in RM50, RM100, and RM200 denominations."
```

### Adding New Policies

Edit `python module/policies.csv`:

```csv
policy_id,title,text,category,scope
pol_gift_cards,Gift Card Policy,Gift cards are valid for 12 months from purchase date.,payment,all
```

### Reingest Data

After editing CSV files:

```bash
cd "python module"
python rag_ingest.py
```

The RAG service will automatically use the new data (no restart needed if using `--reload`).

---

## Troubleshooting

### Bot gives generic "didn't catch that" response

**Cause:** LLM failed to parse or RAG service not running

**Fix:**
1. Check RAG service: `curl http://localhost:8000/health`
2. Check OpenAI API key in `.env`
3. Check console logs for `[LLM NLU]` errors

### Bot doesn't answer FAQ questions

**Cause:** RAG database is empty or not returning results

**Fix:**
1. Verify data count: `curl http://localhost:8000/health`
2. If count is low, run: `python rag_ingest.py`
3. Test RAG directly: `curl "http://localhost:8000/rag/retrieve?q=pet+policy&k=3"`

### Bot responses are too short/long

**Adjust in `handler.js`:**

```javascript
// For FAQ responses, adjust character limit
if (nlu.intent === 'faq' && nlu.follow_up) {
  const answer = String(nlu.follow_up).slice(0, 500); // Change this number
  // ...
}
```

### Bot is too creative/not creative enough

**Adjust in `llm_nlu.js`:**

```javascript
const r = await oa.chat.completions.create({
  model: MODEL,
  messages: messages,
  temperature: 0.85, // Lower = more consistent, Higher = more creative (0.0-2.0)
  // ...
});
```

---

## Architecture Overview

```
Customer Message
    ↓
handler.js (receives message)
    ↓
llm_nlu.js (extracts intent + entities)
    ↓
    ├─→ Calls OpenAI GPT-4o-mini
    │   ├─→ Sends: System prompt + Facts + RAG Context + History
    │   └─→ Returns: JSON with intent, entities, follow_up
    │
    └─→ Fetches RAG context from Python service
        └─→ http://localhost:8000/rag/retrieve?q=...
            └─→ Returns: Top 3 relevant FAQ/policy items
    ↓
handler.js (processes intent)
    ↓
    ├─→ FAQ: Send follow_up answer
    ├─→ Booking: Gather entities or create hold
    ├─→ Confirm: Confirm pending booking
    └─→ Cancel/Reschedule: Update booking
    ↓
Response sent to customer
```

---

## Key Files

- `prompts/System_prompt.txt` - Main bot instructions (simplified!)
- `llm_nlu.js` - NLU processing with RAG integration
- `handler.js` - Main message handler
- `python module/rag_api.py` - RAG service (FastAPI)
- `python module/salon_kb_faq.csv` - FAQ data
- `python module/policies.csv` - Policy data
- `SALON_RULES_EXAMPLE.md` - Guide for adding rules

---

## Next Steps

1. **Monitor Conversations:** Watch for questions the bot can't answer
2. **Add FAQs:** Add those questions to `salon_kb_faq.csv`
3. **Reingest:** Run `python rag_ingest.py`
4. **Test:** Verify bot now answers those questions
5. **Iterate:** Keep improving your knowledge base

Your bot will get smarter over time as you add more data!

---

## Support

If you encounter issues:
1. Check all services are running (Node.js bot + Python RAG)
2. Check console logs for errors
3. Verify `.env` has `OPENAI_API_KEY`
4. Test RAG service directly with curl
5. Run test script: `node test_bot_improvements.js`

Happy booking! 🎉

