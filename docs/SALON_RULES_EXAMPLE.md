# Salon Rules & Guidelines Example

This document shows how to configure your bot's behavior through **data** rather than **hard-coded logic**. The bot will naturally use information from your knowledge base (FAQs, policies) to answer questions creatively.

---

## How It Works

Your bot has access to three data sources:

1. **Database** (`salon.db`) - Services, staff, bookings
2. **FAQ Knowledge Base** (`python module/salon_kb_faq.csv`) - Common questions
3. **Policy Knowledge Base** (`python module/policies.csv`) - Rules and policies

The bot uses **RAG (Retrieval Augmented Generation)** to:
- Find relevant information based on the customer's question
- Use that information to craft natural, helpful responses
- Combine multiple pieces of information when needed

---

## Example Rules Definition

### 1. Service Information

**Where to define:** `python module/salon_kb_faq.csv`

```csv
faq_id,question,answer
faq_services_overview,What services do you offer?,"We offer haircuts, coloring, keratin, rebonding, perms, highlights, bleaching, treatments, head spa, and styling."
faq_haircut_duration,How long does a haircut take?,Haircut typically takes 30-60 minutes depending on style complexity.
faq_coloring_duration,How long does coloring take?,Coloring takes 90-150 minutes depending on technique and hair length.
```

**How the bot uses it:**
- User asks: "What services do you guys provide?"
- RAG retrieves: faq_services_overview
- Bot responds naturally: "We do haircuts, coloring, keratin, rebonding, perms and more! What were you thinking of getting done?"

### 2. Policy Rules

**Where to define:** `python module/policies.csv`

```csv
policy_id,title,text,category,scope
pol_pets,Pet Policy,Only service animals are allowed inside the salon for hygiene and safety.,facility,all
pol_cancel_24h,24h Cancellation,Please cancel at least 24 hours before your appointment to avoid charges.,cancellation,all
pol_parking,Parking,Limited front parking available; nearby paid parking around RM2/hour.,facility,SS15
```

**How the bot uses it:**
- User asks: "Can I bring my dog?"
- RAG retrieves: pol_pets
- Bot responds naturally: "Unfortunately we only allow service animals inside for hygiene reasons. But I'd love to help you book! What service were you looking for?"

### 3. Operating Hours

**Where to define:** `python module/salon_kb_faq.csv`

```csv
faq_id,question,answer
faq_opening_hours,What are your opening hours?,"Tue–Sat 9 AM–7 PM; Sun 10 AM–5 PM; Mon closed."
faq_public_holidays,Are you open on public holidays?,"Hours may vary; please check with us in advance."
```

**How the bot uses it:**
- User asks: "Are you open tomorrow?"
- Bot checks if tomorrow is within hours
- Responds: "Yes we're open tomorrow 9am-7pm! When would you like to come in?"

---

## Creating Your Own Rules

### Step 1: Identify Common Questions

Think about what customers ask:
- Services offered?
- Pricing?
- Cancellation policy?
- Parking?
- Special accommodations?

### Step 2: Add to FAQ CSV

Edit `python module/salon_kb_faq.csv`:

```csv
faq_id,question,answer
faq_wheelchair,Is the salon wheelchair accessible?,"Yes, we have ground-floor access with a portable ramp available on request."
faq_wifi,Do you have WiFi?,Yes, complimentary WiFi is available for all clients.
faq_student_discount,Do you offer student discounts?,"Yes, 10% off Monday–Thursday with valid student ID."
```

### Step 3: Add to Policies CSV

Edit `python module/policies.csv`:

```csv
policy_id,title,text,category,scope
pol_late_15,Late Arrival Policy,"15-minute grace period; after that, service may be shortened or forfeited.",lateness,all
pol_group_booking,Group Bookings,"For 3 or more people, please book at least 48 hours ahead.",booking,all
pol_children,Children Policy,"Children are welcome; please supervise them in the waiting area.",facility,all
```

### Step 4: Reingest into RAG

Run the ingestion script to update the knowledge base:

```bash
cd "python module"
python rag_ingest.py
```

### Step 5: Restart Services

```bash
# Restart Python RAG service
python -m uvicorn rag_api:app --reload --port 8000

# Restart your Node.js bot
npm start
```

---

## Advanced: Combining Multiple Rules

The bot can intelligently combine multiple pieces of information:

**Example:**
User: "How much is a haircut, how long does it take, and can I cancel same day?"

Bot will:
1. RAG retrieves: pricing, duration, cancellation policy
2. Bot combines them naturally: "Haircuts are RM40-80 depending on length and take about 30-60 minutes. For cancellations, we need 24 hours notice - same day cancellations may have a fee. Want to book one?"

---

## Tips for Natural Bot Behavior

### ✅ DO:
- Define information as data (CSV files)
- Let the bot phrase responses naturally
- Provide complete information
- Use conversational language in FAQs
- Group related policies by category

### ❌ DON'T:
- Hard-code responses in the system prompt
- Use robotic language in your data
- Leave information out (customers will ask!)
- Make rules too complex or legalistic
- Forget to reingest after changes

---

## Example Conversation Flow

With proper rules defined, here's how the bot handles complex questions:

```
User: "hi what services do you guys provide and can i bring my dog into the store?"

Bot: "We offer haircuts, coloring, keratin, rebonding, perms and more! Unfortunately we only allow service animals inside for hygiene reasons. Were you looking to book something?"

User: "yeah haircut tomorrow, are you open and do I need a deposit?"

Bot: "Yes we're open tomorrow 9am-7pm! No deposit needed for haircuts. What time works for you?"

User: "3pm, do you have parking?"

Bot: "Limited front parking available, or there's paid parking nearby for about RM2/hour. Who should I book this for?"

User: "Rachel"

Bot: [Creates hold] "Holding ⏳ Haircut with Aida, Fri 22 Dec, 3:00 PM–4:00 PM. Reply Confirm within 2 min to secure it."
```

Notice:
- Multiple questions answered at once
- Natural, flowing conversation
- Information from different sources combined seamlessly
- Bot stays focused on helping complete the booking

---

## Maintenance

Update your rules regularly:
1. Listen to common customer questions
2. Add them to your CSV files
3. Reingest the data
4. Test with sample questions

The bot will automatically use new information without code changes!

