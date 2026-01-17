// nlu.js — robust LLM-based NLU (ESM)
import OpenAI from 'openai';
import 'dotenv/config';
import { db } from '../config/db.js';

// Import modules to read the prompt file
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Read the system prompt from system_prompt.txt
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptPath = path.join(__dirname, '../../prompts', 'System_prompt.txt');
let SYSTEM = '';
try {
  SYSTEM = fs.readFileSync(promptPath, 'utf8');
} catch (e) {
  console.error("CRITICAL ERROR: 'system_prompt.txt' not found.", e);
  process.exit(1); 
}

// Build “facts” for better grounding (live services, staff, hours)
function buildFacts() {
  try {
    const services = db.prepare("SELECT id, name, duration_min FROM services ORDER BY id").all();
    const staff    = db.prepare("SELECT name, aliases, skills FROM staff WHERE active=1 ORDER BY id").all();

    const svcLines = services.map(s => `- ${s.name} (${s.duration_min} min)`).join("\n");

    // Map service id -> name for readability
    const svcById = new Map(services.map(s => [s.id, s.name]));

    const staffLines = staff.map((s) => {
      let aliases = [];
      try { aliases = JSON.parse(s.aliases || "[]"); } catch {}
      let skills = [];
      try { skills = JSON.parse(s.skills || "[]"); } catch {}
      const skillNames = skills
        .map(id => svcById.get(id))
        .filter(Boolean);

      const aliasStr = aliases.length ? `aliases: ${aliases.join(", ")}` : null;
      const skillStr = skillNames.length ? `skills: ${skillNames.join(", ")}` : null;
      const extras = [aliasStr, skillStr].filter(Boolean).join("; ");

      return extras ? `- ${s.name} (${extras})` : `- ${s.name}`;
    }).join("\n");

    return [
      'Services:',
      svcLines || '- none configured',
      'Staff:',
      staffLines || '- our team'
    ].join('\n');
  } catch { return ''; }
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const oa = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function safeParseJSON(s) {
  try { return JSON.parse(s); } catch { 
    const m = String(s).match(/\{[\s\S]*\}$/);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
    return null;
  }
}

// *** UPDATED FUNCTION TO CALL PYTHON RAG ***
export async function extractNLU(history = [], extraContext = null) {
  // Fallback if no key - return empty entities so the handler asks for missing info
  if (!oa) {
    console.warn('[LLM NLU] No OpenAI API key found, returning empty NLU');
    return { intent: "make_booking", entities: {}, confidence: 0.0 }; 
  }

  const userText = history.at(-1)?.content || '';
  const facts = buildFacts();
  const styleSeed = Math.floor(Math.random() * 1_000_000);
  console.log(`[LLM NLU] Processing user message: "${userText}"`);
  console.log(`[LLM NLU] History length: ${history.length} messages`);
  if (extraContext) {
    console.log(`[LLM NLU] Extra context:`, extraContext);
  }

  // *** NEW: Fetch Context from Python RAG API ***
  let ragContext = '(No context found)';
  try {
    // Call the Python service running on port 8000
    const ragUrl = `http://localhost:8000/rag/retrieve?q=${encodeURIComponent(userText)}&k=3`;
    const res = await fetch(ragUrl);
    if (res.ok) {
      const data = await res.json();
      // Combine the top 3 results into a single text block
      if (data.results && data.results.length > 0) {
         ragContext = data.results.map((r, i) => `(${i+1}) ${r.text}`).join('\n');
      }
    }
  } catch (e) {
    // If Python isn't running, we just skip the RAG context. The bot will still work.
    // console.error("RAG Service Error:", e.message); 
  }

  // Dynamic system prompt with REAL RAG context
  const dynamicSystem = `
${SYSTEM.trim()}

---
Facts (Current Salon Info):
${facts || '(none)'}

---
Context (Relevant Policy & FAQ Info):
${ragContext}
${extraContext ? `\n---\nReturning Customer Info:\n${extraContext}` : ''}

---
Style Seed: ${styleSeed}
Use this to vary your phrasing. If the last assistant message asked a similar question, you MUST rephrase it differently now.

---
IMPORTANT: Return ONLY valid JSON. Extract ONLY entities the customer explicitly mentioned in their CURRENT message.
`;

  const messages = [
    { role: 'system', content: dynamicSystem },
    ...history.slice(-7) // Send the last 7 messages
  ];
  
  try {
    console.log(`[LLM NLU] Calling ${MODEL} with ${messages.length} messages`);
    const r = await oa.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: 0.85, // Balanced: creative but reliable
      top_p: 0.95,
      response_format: { type: "json_object" }, 
    });

    const txt = r.choices[0]?.message?.content?.trim() || '';
    console.log(`[LLM NLU] Response:`, txt.substring(0, 200));
    
    if (!txt) {
      console.error('[LLM NLU] Empty response from LLM');
      return { intent: 'make_booking', entities: {}, confidence: 0.0 };
    }
    
    const obj = safeParseJSON(txt);
    if (obj && typeof obj.intent === 'string') {
      // Ensure entities object exists (can be empty for smalltalk/faq)
      if (!obj.entities) {
        obj.entities = {};
      }
      console.log(`[LLM NLU] Parsed intent: ${obj.intent}, entities:`, JSON.stringify(obj.entities));
      return obj;
    }
    console.warn('[LLM NLU] Failed to parse valid NLU object from response:', txt);
  } catch (e) {
    console.error("LLM NLU Error:", e.message || e);
  }
  
  return { intent: 'unknown', entities: {}, confidence: 0.0 };
}