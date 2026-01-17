// messageHandler.js — unified logic: logging + suggestions + pending/confirm + time-only context

import dayjs from "dayjs";
import "../config/tz-setup.js";
import { resolveNext } from "../utils/time.js";
import { db } from "../config/db.js";
import { generateSlots } from "../services/availability.js";
import crypto from "crypto";
import { matchServiceWithScore, matchStaffWithScore } from "../services/matching.js";
import { extractNLU } from "../services/nlu.js";

const HOLD_MINUTES = parseInt(process.env.HOLD_MINUTES || "2", 10);

// first inbound helper (for greeting)
const qFirstMsgAt = db.prepare(`
  SELECT MIN(created_at) AS first_at FROM message_log WHERE phone=? AND direction='in'
`);

// ---------- Prepared statements ----------
const qFindService      = db.prepare("SELECT * FROM services WHERE LOWER(name)=LOWER(?)");
const qFindStaff        = db.prepare("SELECT * FROM staff WHERE LOWER(name)=LOWER(?)");

const qClashConfirmed   = db.prepare("SELECT 1 FROM bookings WHERE staff_id=? AND start_dt=? AND status='confirmed' LIMIT 1");
const qClashActive      = db.prepare(
  "SELECT 1 FROM bookings WHERE staff_id=? AND start_dt=? AND (status='confirmed' OR (status='pending' AND hold_until > datetime('now'))) LIMIT 1"
);

const qInsertPending    = db.prepare(`
  INSERT INTO bookings (phone, staff_id, service_id, start_dt, end_dt, status, hold_until, reschedule_of)
  VALUES (?, ?, ?, ?, ?, 'pending', ?, NULL)
`);
const qConfirm          = db.prepare(`UPDATE bookings SET status='confirmed', hold_until=NULL WHERE id=? AND status='pending'`);
const qGetById          = db.prepare(`SELECT * FROM bookings WHERE id=?`);

const qLatestPendingFor   = db.prepare(`
  SELECT * FROM bookings
  WHERE phone=? AND status='pending' AND hold_until > datetime('now')
  ORDER BY id DESC LIMIT 1
`);
const qLatestConfirmedFor = db.prepare(`
  SELECT * FROM bookings
  WHERE phone=? AND status='confirmed'
  ORDER BY id DESC LIMIT 1
`);
const qLastBookingForService = db.prepare(`
  SELECT b.*, s.name as staff_name
  FROM bookings b
  JOIN staff s ON b.staff_id = s.id
  WHERE b.phone=? AND b.service_id=? AND b.status='confirmed'
  ORDER BY b.start_dt DESC LIMIT 1
`);
const qCancelById       = db.prepare(`UPDATE bookings SET status='cancelled', hold_until=NULL WHERE id=?`);
const qExpirePendings   = db.prepare(`UPDATE bookings SET status='cancelled', hold_until=NULL WHERE status='pending' AND hold_until <= datetime('now')`);

const qLog              = db.prepare(`INSERT INTO message_log(direction, phone, body) VALUES (?,?,?)`);
const qTokenByBooking   = db.prepare(`SELECT token FROM booking_tokens WHERE booking_id=?`);
const qInsertToken      = db.prepare(`INSERT OR IGNORE INTO booking_tokens (booking_id, token, expires_at) VALUES (?,?,?)`);

// Upsert customer and get name
const qUpsertCustomer   = db.prepare(`
  INSERT INTO customers (phone_e164, name) VALUES (?, ?)
  ON CONFLICT(phone_e164) DO UPDATE SET name=COALESCE(excluded.name, customers.name)
`);
const qGetCustomerName  = db.prepare("SELECT name FROM customers WHERE phone_e164 = ?");

const qSvcByIdFull      = db.prepare("SELECT * FROM services WHERE id=?");
const qStfByIdFull      = db.prepare("SELECT * FROM staff WHERE id=?");

// NEW: lists for menu
const qListServices = db.prepare(`SELECT name, duration_min FROM services ORDER BY id`);
const qListStaff    = db.prepare(`SELECT name FROM staff WHERE active=1 ORDER BY id`);

// Session context
const qSetCtx = db.prepare(`
  INSERT INTO session_ctx (phone, service_id, staff_id, date_local, expires_at)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(phone) DO UPDATE SET
    service_id=excluded.service_id,
    staff_id=excluded.staff_id,
    date_local=excluded.date_local,
    expires_at=excluded.expires_at
`);
const qGetCtx   = db.prepare(`SELECT * FROM session_ctx WHERE phone=? AND expires_at > datetime('now')`);
const qClearCtx = db.prepare(`DELETE FROM session_ctx WHERE phone=?`);
const qSetOpts = db.prepare(`
  INSERT INTO session_opts (phone, options_json, expires_at)
  VALUES (?, ?, ?)
  ON CONFLICT(phone) DO UPDATE SET options_json=excluded.options_json, expires_at=excluded.expires_at
`);
const qGetOpts = db.prepare(`SELECT * FROM session_opts WHERE phone=? AND expires_at > datetime('now')`);
const qClearOpts = db.prepare(`DELETE FROM session_opts WHERE phone=?`);

// Query for message history
const qRecentLogs = db.prepare(`
  SELECT direction, body FROM message_log
  WHERE phone=? ORDER BY id DESC LIMIT 7
`);

// ---------- helpers ----------
function buildMenu() {
  const services = qListServices.all();
  const staff = qListStaff.all();

  const svcLines = services
    .map(s => `• ${s.name} (${s.duration_min} min)`)
    .join("\n");

  const staffNames = staff.map(s => s.name).join(", ") || "our team";

  return (
    svcLines +
    `\n\nTeam: ${staffNames}`
  );
}

// Store recommended slot for later acceptance
function storeRecommendation(phone, recommendation) {
  const expiresAt = dayjs().add(5, 'minute').toISOString();
  const data = JSON.stringify({
    type: 'recommendation',
    serviceId: recommendation.serviceId,
    staffId: recommendation.staffId,
    start: recommendation.start,
    end: recommendation.end
  });
  qSetOpts.run(phone, data, expiresAt);
}

// Get stored recommendation
function getRecommendation(phone) {
  const opt = qGetOpts.get(phone);
  if (!opt) return null;
  try {
    const data = JSON.parse(opt.options_json || '{}');
    if (data.type === 'recommendation') {
      return data;
    }
  } catch {}
  return null;
}

// Store suggested staff for returning customer
function storeSuggestedStaff(phone, staffName, serviceName) {
  const expiresAt = dayjs().add(5, 'minute').toISOString();
  const data = JSON.stringify({
    type: 'suggested_staff',
    staffName: staffName,
    serviceName: serviceName
  });
  qSetOpts.run(phone, data, expiresAt);
}

// Get suggested staff
function getSuggestedStaff(phone) {
  const opt = qGetOpts.get(phone);
  if (!opt) return null;
  try {
    const data = JSON.parse(opt.options_json || '{}');
    if (data.type === 'suggested_staff') {
      return data;
    }
  } catch {}
  return null;
}

// Find next best available time slot
function findNextBestSlot({ serviceId, staffId, requestedDateTime, staffPool = null }) {
  console.log('[findNextBestSlot] Starting search:', { serviceId, staffId, requestedDateTime, staffPool });
  
  const svc = qSvcByIdFull.get(serviceId);
  if (!svc) {
    console.log('[findNextBestSlot] Service not found');
    return null;
  }

  const requestedMoment = dayjs(requestedDateTime);
  const requestedHour = requestedMoment.hour();
  const isAfternoon = requestedHour >= 12;
  
  console.log('[findNextBestSlot] Request time:', { 
    formatted: requestedMoment.format('YYYY-MM-DD HH:mm'),
    hour: requestedHour, 
    isAfternoon 
  });
  
  // Search strategy: same day afternoon > next day same time > next day afternoon
  const searchDates = [];
  
  // 1. Same day afternoon (if request was in morning)
  if (!isAfternoon) {
    searchDates.push({
      date: requestedMoment.format("YYYY-MM-DD"),
      label: "this afternoon",
      startHour: 12
    });
  }
  
  // 2. Next day same time period
  const nextDay = requestedMoment.add(1, 'day');
  searchDates.push({
    date: nextDay.format("YYYY-MM-DD"),
    label: nextDay.format("ddd D MMM"),
    startHour: isAfternoon ? 12 : 9
  });
  
  // 3. Next day afternoon (if request wasn't afternoon)
  if (!isAfternoon) {
    searchDates.push({
      date: nextDay.format("YYYY-MM-DD"),
      label: `${nextDay.format("ddd D MMM")} afternoon`,
      startHour: 12
    });
  }
  
  // 4. Day after next, same time period
  const dayAfterNext = requestedMoment.add(2, 'day');
  searchDates.push({
    date: dayAfterNext.format("YYYY-MM-DD"),
    label: dayAfterNext.format("ddd D MMM"),
    startHour: isAfternoon ? 12 : 9
  });

  console.log('[findNextBestSlot] Search dates:', searchDates);

  // Determine staff to check
  const staffToCheck = staffPool || [staffId];
  console.log('[findNextBestSlot] Staff to check:', staffToCheck);
  
  for (const searchDate of searchDates) {
    for (const sid of staffToCheck) {
      try {
        console.log('[findNextBestSlot] Checking:', { date: searchDate.date, staffId: sid, serviceId });
        
        const slots = generateSlots({
          dateISO: searchDate.date,
          serviceDurationMin: svc.duration_min,
          staffId: sid
        });
        
        console.log('[findNextBestSlot] Generated slots:', slots?.length || 0);
        
        if (!slots || slots.length === 0) continue;
        
        // Filter slots based on time period
        const filteredSlots = slots.filter(slot => {
          const slotMoment = dayjs(slot.start);
          return slotMoment.hour() >= searchDate.startHour;
        });
        
        console.log('[findNextBestSlot] Filtered slots:', filteredSlots.length);
        
        if (filteredSlots.length > 0) {
          const bestSlot = filteredSlots[0];
          const staff = qStfByIdFull.get(sid);
          console.log('[findNextBestSlot] Found best slot:', {
            start: bestSlot.start,
            staff: staff?.name
          });
          return {
            start: bestSlot.start,
            end: bestSlot.end,
            staff: staff,
            label: searchDate.label,
            staffId: sid,
            serviceId: serviceId
          };
        }
      } catch (e) {
        console.error('[findNextBestSlot] Error:', e.message, e.stack);
        continue;
      }
    }
  }
  
  console.log('[findNextBestSlot] No slots found, returning null');
  return null;
}

// ---------- Main handler ----------
export async function handleInboundMessage({ from, text }) {
  // expire stale holds
  qExpirePendings.run();

  // *** NEW CUSTOMER GREETING LOGIC ***
  const firstSeen = qFirstMsgAt.get(from)?.first_at;
  
  if (!firstSeen) {
    qLog.run('in', from, text || '');
    try { qUpsertCustomer.run(from, null); } catch {}

    const menu = buildMenu();
    const welcome = [
      "Hi! Welcome to FEIN booking. ✨",
      "I see this is our first time chatting. Here's a quick look at our main services:",
      "", 
      menu,
      "",
      "You can ask me to book something (like 'Haircut tomorrow at 3pm'), or just ask any questions you have!"
    ].join('\n');
    
    qLog.run('out', from, welcome);
    return welcome; 
  }

  // log inbound
  qLog.run('in', from, text || '');
  try { qUpsertCustomer.run(from, null); } catch {}

  // Fetch history
  const historyRows = qRecentLogs.all(from).reverse(); 
  const history = historyRows.map(r => ({
    role: r.direction === 'in' ? 'user' : 'assistant',
    content: r.body
  }));
  
  // LLM NLU (first pass without returning customer context)
  const nlu = await extractNLU(history);
  const entities = nlu?.entities || {};
  
  // If NLU parsing completely failed, provide a helpful fallback
  if (!nlu || nlu.intent === 'unknown') {
    console.warn('[Handler] NLU returned unknown intent, checking for basic patterns');
    // Check if this looks like a date/time response
    const hasDateTime = /\b(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(am|pm|:\d{2})|\d{1,2}\s*(am|pm))/i.test(text || '');
    if (hasDateTime) {
      // Treat as booking continuation
      nlu.intent = 'make_booking';
      console.log('[Handler] Detected date/time pattern, treating as make_booking');
    }
  }

  // Save name if found
  if (entities.name) {
    try { qUpsertCustomer.run(from, entities.name); } catch(e) { console.error("Error upserting customer name:", e); }
  }

  // *** FAQ: Questions about services, policies, hours, etc. ***
  // The LLM will use RAG context to answer questions naturally in follow_up
  if (nlu.intent === 'faq' && nlu.follow_up) {
    const answer = String(nlu.follow_up).slice(0, 500); // Allow longer answers for detailed FAQs
    qLog.run('out', from, answer);
    return answer;
  }

  // Smalltalk
  if (nlu.intent === 'smalltalk' && nlu.smalltalk_reply) {
    const out = String(nlu.smalltalk_reply).slice(0, 300);
    qLog.run('out', from, out);
    return out;
  }

  // *** ACCEPT RECOMMENDED SLOT ***
  // Check if customer is accepting a previously recommended slot
  // BUT: Skip this if they're confirming a pending booking (intent is 'confirm')
  const recommendation = getRecommendation(from);
  if (recommendation && nlu.intent !== 'confirm' && text.toLowerCase().match(/\b(that works|that's fine|sounds good|okay|ok|yes|perfect|great)\b/)) {
    const svc = qSvcByIdFull.get(recommendation.serviceId);
    const stf = qStfByIdFull.get(recommendation.staffId);
    
    if (!svc || !stf) {
      qClearOpts.run(from);
      const reply = "Sorry, that recommendation expired. What time would you like?";
      qLog.run('out', from, reply);
      return reply;
    }

    const holdUntilISO = dayjs().add(HOLD_MINUTES, "minute").toISOString();
    try {
      db.transaction(() => {
        const clash = qClashActive.get(recommendation.staffId, recommendation.start);
        if (clash) throw new Error('SLOT_TAKEN');
        qInsertPending.run(from, recommendation.staffId, recommendation.serviceId, recommendation.start, recommendation.end, holdUntilISO);
      })();
      qClearOpts.run(from);
      
      const reply = 
        `Holding ⏳ *${svc.name}* with *${stf.name}*, ` +
        `${dayjs(recommendation.start).format("ddd D MMM, h:mm A")}–${dayjs(recommendation.end).format("h:mm A")}.\n` +
        `Reply *Confirm* within ${HOLD_MINUTES} min to secure it.`;
      qLog.run('out', from, reply);
      return reply;
    } catch (e) {
      qClearOpts.run(from);
      const reply = "That slot was just taken too! Let me find another option. What time would you like?";
      qLog.run('out', from, reply);
      return reply;
    }
  }

  // *** BOOKING FLOW: Follow-up questions for missing info ***
  // For reschedule/change_service, the LLM asks clarifying questions
  if (nlu.follow_up && ['reschedule', 'change_service'].includes(nlu.intent)) {
    const ask = String(nlu.follow_up).slice(0, 300);
    qLog.run('out', from, ask);
    return ask;
  }

  // Numeric selection 1/2/3
  const sel = (text||'').trim();
  if (/^[1-3]$/.test(sel)) {
    const opt = qGetOpts.get(from);
    if (opt) {
      try {
        const list = JSON.parse(opt.options_json || '[]');
        const idx = parseInt(sel,10) - 1;
        const chosen = list[idx];
        if (chosen) {
          const holdUntilISO = dayjs().add(HOLD_MINUTES, "minute").toISOString();
          const tx = db.transaction(() => {
            const clash = qClashActive.get(chosen.staff_id, chosen.start_dt);
            if (clash) throw new Error('SLOT_TAKEN');
            qInsertPending.run(from, chosen.staff_id, chosen.service_id, chosen.start_dt, chosen.end_dt, holdUntilISO);
          });
          tx();
          qClearOpts.run(from);
          const svcRow = qSvcByIdFull.get(chosen.service_id);
          const stfRow = qStfByIdFull.get(chosen.staff_id);
          const reply = `Holding — *${svcRow.name}* with *${stfRow.name}*, ${dayjs(chosen.start_dt).format('ddd D MMM, h:mm A')}–${dayjs(chosen.end_dt).format('h:mm A')}.\nReply *Confirm* within ${HOLD_MINUTES} min to secure it.`;
          qLog.run('out', from, reply);
          return reply;
        }
      } catch {}
    }
  }

  // --- TIME-ONLY REPLY USING CONTEXT (Fallback) ---
  const ctx = qGetCtx.get(from);
  if (ctx && entities.time && (!entities.service || !entities.date)) {
    const svcRow = qSvcByIdFull.get(ctx.service_id);
    const stfRow = qStfByIdFull.get(ctx.staff_id);

    if (!svcRow || !stfRow) {
      qClearCtx.run(from);
      const reply = "Hmm, I lost the previous selection. Please say the service and date again.";
      qLog.run('out', from, reply);
      return reply;
    }
    const start_dt = resolveNext(ctx.date_local, entities.time);
    if (!start_dt) {
      const reply = "I couldn't read that time. Try '10:00 AM'.";
      qLog.run('out', from, reply);
      return reply;
    }
    const startISO = dayjs(start_dt).toISOString();
    const endISO   = dayjs(startISO).add(svcRow.duration_min, "minute").toISOString();
    const holdUntilISO = dayjs().add(HOLD_MINUTES, "minute").toISOString();
    try {
      db.transaction(() => {
        const clash = qClashActive.get(stfRow.id, startISO);
        if (clash) throw new Error("Slot taken");
        qInsertPending.run(from, stfRow.id, svcRow.id, startISO, endISO, holdUntilISO);
      })();
    } catch (e) {
      // Find next best available slot
      const nextBest = findNextBestSlot({
        serviceId: svcRow.id,
        staffId: stfRow.id,
        requestedDateTime: startISO,
        staffPool: [stfRow.id]
      });
      
      let reply = "That slot was just taken. ";
      if (nextBest) {
        storeRecommendation(from, nextBest);
        reply += `How about ${nextBest.label} at ${dayjs(nextBest.start).format('h:mm A')} with ${nextBest.staff.name}? Or what time works for you?`;
      } else {
        reply += "What other time works for you?";
      }
      qLog.run('out', from, reply);
      return reply;
    }
    qClearCtx.run(from);
    const reply =
      `Holding ⏳ *${svcRow.name}* with *${stfRow.name}*, ` +
      `${dayjs(startISO).format("ddd D MMM, h:mm A")}–${dayjs(endISO).format("h:mm A")}.\n` +
      `Reply *Confirm* within ${HOLD_MINUTES} min to secure it.`;
    qLog.run('out', from, reply);
    return reply;
  }

  // --- CONFIRM latest pending ---
  if (nlu.intent === "confirm") {
    const pend = qLatestPendingFor.get(from);
    if (!pend) {
      const reply = "I don't see a pending booking to confirm. Try 'Book Haircut Fri 3pm with Aida'.";
      qLog.run('out', from, reply);
      return reply;
    }
    const clash = qClashConfirmed.get(pend.staff_id, pend.start_dt);
    if (clash) {
      qCancelById.run(pend.id);
      
      // Find next best available slot
      const nextBest = findNextBestSlot({
        serviceId: pend.service_id,
        staffId: pend.staff_id,
        requestedDateTime: pend.start_dt,
        staffPool: [pend.staff_id]
      });
      
      let reply = "That slot was just taken while on hold. ";
      if (nextBest) {
        storeRecommendation(from, nextBest);
        // Store context for possible new time
        const contextDate = dayjs(nextBest.start).format('YYYY-MM-DD');
        const expiresAt = dayjs().add(10, 'minute').toISOString();
        qSetCtx.run(from, pend.service_id, pend.staff_id, contextDate, expiresAt);
        reply += `How about ${nextBest.label} at ${dayjs(nextBest.start).format('h:mm A')} with ${nextBest.staff.name}? Or what time works for you?`;
      } else {
        reply += "What other time works for you?";
      }
      qLog.run('out', from, reply);
      return reply;
    }
    if (pend.reschedule_of) {
      try {
        db.transaction(() => {
          const old = qGetById.get(pend.reschedule_of);
          if (!old) throw new Error('old_missing');
          qConfirm.run(pend.id);
          if (old.status === 'confirmed') qCancelById.run(old.id);
        })();
      } catch (e) {
        const reply = "Reschedule failed. Please try another time.";
        qLog.run('out', from, reply);
        return reply;
      }
    } else {
      qConfirm.run(pend.id);
    }
    const svcRow = qSvcByIdFull.get(pend.service_id);
    const stfRow = qStfByIdFull.get(pend.staff_id);
    const when = `${dayjs(pend.start_dt).format("ddd D MMM, h:mm A")}–${dayjs(pend.end_dt).format("h:mm A")}`;
    
    // Get customer name for personalization
    const customerName = qGetCustomerName.get(from)?.name;
    const namePrefix = customerName ? `${customerName}, your ` : "";
    
    const reply = `Confirmed ✅ ${namePrefix}${svcRow?.name || "Service"} with ${stfRow?.name || "Staff"} is booked for ${when}.`;
    qLog.run('out', from, reply);
    qClearCtx.run(from);
    return reply;
  }

  // --- CANCEL latest confirmed ---
  if (nlu.intent === "cancel") {
    const latest = qLatestConfirmedFor.get(from);
    if (!latest) {
      const reply = "I can't find a confirmed booking to cancel.";
      qLog.run('out', from, reply);
      return reply;
    }
    qCancelById.run(latest.id);
    const reply = "Cancelled ✅ Your slot is free again.";
    qLog.run('out', from, reply);
    qClearCtx.run(from);
    return reply;
  }

  // --- MAKE BOOKING ---
  if (nlu.intent === "make_booking") {
    
    // 1. Get all known entities from the LLM
    let { service, date, time, staff: staffName } = entities;
    
    console.log('[make_booking] Extracted entities:', { service, date, time, staffName });
    
    // Check if customer is accepting a suggested staff from previous message
    const suggestedStaff = getSuggestedStaff(from);
    if (suggestedStaff && !staffName && service === suggestedStaff.serviceName) {
      // Check if message is an affirmative response
      const lowerMsg = (text || '').toLowerCase().trim();
      const affirmatives = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'that works', 'sounds good', 'perfect'];
      const isAffirmative = affirmatives.some(word => lowerMsg.includes(word));
      
      // Also check if they mentioned the staff name directly
      const mentionsStaff = lowerMsg.includes(suggestedStaff.staffName.toLowerCase());
      
      if (isAffirmative || mentionsStaff) {
        staffName = suggestedStaff.staffName;
        console.log('[make_booking] Customer accepted suggested staff:', staffName);
        qClearOpts.run(from); // Clear the suggestion
      }
    }
    
    // 2. Check if we know the customer's name
    const customerName = qGetCustomerName.get(from)?.name;
    
    console.log('[make_booking] Customer name:', customerName);
    console.log('[make_booking] Has all info?', { service, date, time, customerName });

    // 3. Check if we have EVERYTHING needed for a hold
    if (service && date && time && customerName) {
      // ---- ALL INFO IS PRESENT: CREATE HOLD ----
      
      const svc = qFindService.get(service);
      let stf = staffName ? qFindStaff.get(staffName) : null;
      if (!stf) {
        const ms = matchStaffWithScore(staffName || "any", svc?.id);
        stf = ms.staff || null;
      }
      if (!svc || !stf) {
        const reply = "I couldn't find that service or staff. Let's try again. What service would you like?";
        qLog.run('out', from, reply);
        return reply;
      }

      const start_dt = resolveNext(date, time);
      if (!start_dt) {
        const reply = "I couldn't resolve that date/time—try 'Fri 3pm'.";
        qLog.run('out', from, reply);
        return reply;
      }

      const startISO = dayjs(start_dt).toISOString();
      const endISO   = dayjs(startISO).add(svc.duration_min, "minute").toISOString();
      const holdUntilISO = dayjs().add(HOLD_MINUTES, "minute").toISOString();

      const anyPool = matchStaffWithScore(staffName || "any", svc.id).pool?.map(p => p.id) || [];
      const order = stf?.id ? [stf.id, ...anyPool.filter(id => id !== stf.id)] : anyPool;
      let held = false;
      for (const sid of order) {
        try {
          db.transaction((args) => {
            const [phone, staffId2, serviceId, sISO, eISO, holdISO] = args;
            const clash = qClashActive.get(staffId2, sISO);
            if (clash) throw new Error('SLOT_TAKEN');
            qInsertPending.run(phone, staffId2, serviceId, sISO, eISO, holdISO);
          })([from, sid, svc.id, startISO, endISO, holdUntilISO]);
          held = true;
          stf = qStfByIdFull.get(sid);
          break;
        } catch {}
      }
      if (!held) {
        // Find next best available slot across the staff pool
        const nextBest = findNextBestSlot({
          serviceId: svc.id,
          staffId: stf.id,
          requestedDateTime: startISO,
          staffPool: order
        });
        
      let reply = "That time slot isn't available. ";
      if (nextBest) {
        storeRecommendation(from, nextBest);
        // Also store context so if they provide a new time, we can use the same service/staff
        const contextDate = dayjs(nextBest.start).format('YYYY-MM-DD');
        const expiresAt = dayjs().add(10, 'minute').toISOString();
        qSetCtx.run(from, svc.id, stf.id, contextDate, expiresAt);
        reply += `How about ${nextBest.label} at ${dayjs(nextBest.start).format('h:mm A')} with ${nextBest.staff.name}? Or what time works for you?`;
      } else {
        reply += "What other time works for you?";
      }
      qLog.run('out', from, reply);
      return reply;
      }

      const reply =
        `Holding ⏳ *${svc.name}* with *${stf.name}*, ` +
        `${dayjs(startISO).format("ddd D MMM, h:mm A")}–${dayjs(endISO).format("h:mm A")}.\n` +
        `Reply *Confirm* within ${HOLD_MINUTES} min to secure it, or it will be released.`;
      qLog.run('out', from, reply);
      return reply;

    } else {
      // ---- INFO IS MISSING: CHECK FOR RETURNING CUSTOMER ----
      
      // If we have a service but no staff, check for previous bookings with that service
      if (service && !staffName) {
        const svc = qFindService.get(service);
        if (svc) {
          const lastBooking = qLastBookingForService.get(from, svc.id);
          if (lastBooking && lastBooking.staff_name) {
            const bookingDate = dayjs(lastBooking.start_dt).format('MMM D, YYYY');
            console.log('[Returning Customer] Found previous booking:', { 
              service: svc.name, 
              staff: lastBooking.staff_name, 
              date: bookingDate 
            });
            
            // Store the suggested staff for later acceptance
            storeSuggestedStaff(from, lastBooking.staff_name, svc.name);
            
            // Personalized response for returning customer
            const ask = `Welcome back${customerName ? ' ' + customerName : ''}! I see you booked your last ${svc.name.toLowerCase()} with ${lastBooking.staff_name} - would you like to book with ${lastBooking.staff_name} again? Or would you prefer someone else?`;
            qLog.run('out', from, ask);
            return ask;
          }
        }
      }
      
      // Default: use LLM's follow-up question
      if (nlu.follow_up) {
        const ask = String(nlu.follow_up).slice(0, 300);
        qLog.run('out', from, ask);
        return ask;
      } else {
        const menu = buildMenu();
        const out = "Here's our service menu:\n\n" + menu;
        qLog.run('out', from, out);
        return out;
      }
    }
  }

    // --- RESCHEDULE existing booking (change date/time; keep service & staff by default) ---
  if (nlu.intent === "reschedule") {
    const latest = qLatestConfirmedFor.get(from);
    if (!latest) {
      const reply = "I can't find a confirmed booking to reschedule.";
      qLog.run('out', from, reply);
      return reply;
    }

    // We already have this at the top of the handler:
    // const entities = nlu?.entities || {};

    // Figure out which service & staff we are rescheduling.
    // Default: use the existing booking's service & staff.
    let svc = qSvcByIdFull.get(latest.service_id);
    let stf = qStfByIdFull.get(latest.staff_id);

    // Allow the user to change service or staff as part of rescheduling if they mention it.
    const svcName = (entities.service || "").trim();
    if (svcName) {
      const foundSvc = qFindService.get(svcName);
      if (!foundSvc) {
        const reply = `I couldn't find the service "${svcName}". Can you try a service name from the menu?`;
        qLog.run('out', from, reply);
        return reply;
      }
      svc = foundSvc;
    }

    const staffName = (entities.staff || "").trim();
    if (staffName) {
      const foundStaff = qFindStaff.get(staffName);
      if (!foundStaff) {
        const reply = `I couldn't find staff "${staffName}". Can you try another name?`;
        qLog.run('out', from, reply);
        return reply;
      }
      stf = foundStaff;
    }

    if (!svc || !stf) {
      const reply = "I had trouble reading your existing booking. Please try again or make a new booking.";
      qLog.run('out', from, reply);
      return reply;
    }

    // Work out the new date & time.
    // If user only gives a time ("2pm"), we keep the same date as the original booking.
    const dateWord = entities.date || dayjs(latest.start_dt).format("YYYY-MM-DD");
    const timeWord = entities.time;

    if (!timeWord) {
      const ask =
        (nlu.follow_up && String(nlu.follow_up).slice(0, 300)) ||
        `Okay, for your ${svc.name.toLowerCase()} with ${stf.name}, what time would you like?`;
      qLog.run('out', from, ask);
      return ask;
    }

    const start_dt = resolveNext(dateWord, timeWord);
    if (!start_dt) {
      const reply = "I couldn't read that new date or time. Try something like 'tomorrow at 2pm'.";
      qLog.run('out', from, reply);
      return reply;
    }

    const startISO = dayjs(start_dt).toISOString();
    const endISO   = dayjs(startISO).add(svc.duration_min, "minute").toISOString();
    const holdUntilISO = dayjs().add(HOLD_MINUTES, "minute").toISOString();

    // Prefer the same staff first, then fall back to any active staff if needed.
    const allStaff = db.prepare('SELECT id FROM staff WHERE active=1').all().map(r => r.id);
    const staffOrder = [stf.id, ...allStaff.filter(id => id !== stf.id)];

    let held = null;
    for (const sid of staffOrder) {
      try {
        db.transaction(() => {
          if (qClashActive.get(sid, startISO)) throw new Error("busy");
          qInsertPending.run(from, sid, svc.id, startISO, endISO, holdUntilISO);
          // Link this pending booking back to the old one so the CONFIRM logic can cancel the old slot.
          db.prepare('UPDATE bookings SET reschedule_of=? WHERE id=last_insert_rowid()').run(latest.id);
        })();
        held = sid;
        break;
      } catch (e) {
        // slot busy, try next staff
      }
    }

    if (!held) {
      // Find next best available slot
      const nextBest = findNextBestSlot({
        serviceId: svc.id,
        staffId: stf.id,
        requestedDateTime: startISO,
        staffPool: staffOrder
      });
      
      let reply = `That time isn't available for your ${svc.name.toLowerCase()}. `;
      if (nextBest) {
        storeRecommendation(from, nextBest);
        // Store context for possible new time
        const contextDate = dayjs(nextBest.start).format('YYYY-MM-DD');
        const expiresAt = dayjs().add(10, 'minute').toISOString();
        qSetCtx.run(from, svc.id, stf.id, contextDate, expiresAt);
        reply += `How about ${nextBest.label} at ${dayjs(nextBest.start).format('h:mm A')} with ${nextBest.staff.name}? Or what time works for you?`;
      } else {
        reply += "What other time works for you?";
      }
      qLog.run('out', from, reply);
      return reply;
    }

    const heldStaff = qStfByIdFull.get(held);
    const reply =
      `Holding — *${svc.name}* with *${heldStaff.name}*, ` +
      `${dayjs(startISO).format("ddd D MMM, h:mm A")}–${dayjs(endISO).format("h:mm A")}.\n` +
      `Reply *Confirm* to change your booking.`;
    qLog.run('out', from, reply);
    return reply;
  }


  // --- CHANGE SERVICE ---
  if (nlu.intent === "change_service") {
    // (same logic as before)
    const latest = qLatestConfirmedFor.get(from);
    if (!latest) {
      const reply = "I can't find a confirmed booking to change.";
      qLog.run('out', from, reply);
      return reply;
    }
    const newSvcName = (entities?.new_service || entities?.service || "").trim();
    if (!newSvcName) {
      const reply = "Which service would you like instead?";
      qLog.run('out', from, reply);
      return reply;
    }
    const newSvc = qFindService.get(newSvcName);
    if (!newSvc) {
      const reply = `I couldn't find "${newSvcName}". Try a service name from the menu.`;
      qLog.run('out', from, reply);
      return reply;
    }
    const startISO = dayjs(latest.start_dt).toISOString();
    const endISO   = dayjs(startISO).add(newSvc.duration_min, "minute").toISOString();
    const holdUntilISO = dayjs().add(HOLD_MINUTES, "minute").toISOString();
    const staffOrder = [latest.staff_id, ...db.prepare('SELECT id FROM staff WHERE active=1').all().map(r=>r.id).filter(id=>id!==latest.staff_id)];
    let held = null;
    for (const sid of staffOrder) {
      try {
        db.transaction(() => {
          if (qClashActive.get(sid, startISO)) throw new Error('busy');
          qInsertPending.run(from, sid, newSvc.id, startISO, endISO, holdUntilISO);
          db.prepare('UPDATE bookings SET reschedule_of=? WHERE id=last_insert_rowid()').run(latest.id);
        })();
        held = sid; break;
      } catch {}
    }
    if (!held) {
      // Find next best available slot
      const nextBest = findNextBestSlot({
        serviceId: newSvc.id,
        staffId: latest.staff_id,
        requestedDateTime: startISO,
        staffPool: staffOrder
      });
      
      let reply = `That time isn't available for ${newSvc.name}. `;
      if (nextBest) {
        storeRecommendation(from, nextBest);
        // Store context for possible new time
        const contextDate = dayjs(nextBest.start).format('YYYY-MM-DD');
        const expiresAt = dayjs().add(10, 'minute').toISOString();
        qSetCtx.run(from, newSvc.id, latest.staff_id, contextDate, expiresAt);
        reply += `How about ${nextBest.label} at ${dayjs(nextBest.start).format('h:mm A')} with ${nextBest.staff.name}? Or what time works for you?`;
      } else {
        reply += "What other time works for you?";
      }
      qLog.run('out', from, reply);
      return reply;
    }
    const heldStaff = qStfByIdFull.get(held);
    const reply = `Holding — *${newSvc.name}* with *${heldStaff.name}* at ${dayjs(startISO).format('ddd D MMM, h:mm A')}.\nReply *Confirm* to change your booking.`;
    qLog.run('out', from, reply);
    return reply;
  }

  // --- DEFAULT help ---
  const reply = "Sorry, I didn't quite catch that. I can help you book, reschedule, or cancel an appointment.";
  qLog.run('out', from, reply);
  return reply;
}