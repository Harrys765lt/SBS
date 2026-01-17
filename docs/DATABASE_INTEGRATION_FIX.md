# Database Integration Fix - salon.db Connection

## Issue Identified

The merchant portal dashboard and web bookings were using **separate databases**:
- ❌ **BookingDb/bookings.db** - Only had 10 web bookings
- ✅ **salon.db (root)** - Had 48 WhatsApp bot bookings + all services and staff

This caused the dashboard to show incomplete or zero data because it wasn't reading from the main booking database.

## Solution Implemented

### ✅ Connected All Systems to salon.db

All booking operations now use `salon.db` as the **single source of truth**:

1. **Dashboard Statistics** → Reads from salon.db
2. **Web Bookings** → Writes to salon.db  
3. **Booking Management** → Reads/Updates salon.db
4. **Service/Staff Data** → Reads from salon.db

---

## Files Modified

### 1. `server.js` - Dashboard API Endpoints

**Changed:** All dashboard statistics endpoints now query `salon.db`

```javascript
// Before: const bookingDb = new Database(...'BookingDb/bookings.db');
// After:  const salonDb = new Database(...'salon.db');
```

**Updated Endpoints:**
- `GET /api/dashboard/stats/:merchant_id` - KPI statistics
- `GET /api/dashboard/bookings-by-time/:merchant_id` - Hourly distribution
- `GET /api/dashboard/top-services/:merchant_id` - Top performing services
- `GET /api/dashboard/monthly-trend/:merchant_id` - Monthly trends

**Schema Adaptations:**
- Uses `start_dt` instead of `booking_date`
- Uses `status = 'confirmed'` instead of `status != 'cancelled'`
- Calculates revenue from `services.price` table
- Uses phone-based customer identification

### 2. `routes/bookings.js` - Booking Operations

**Changed:** All booking CRUD operations now use `salon.db`

**Key Changes:**

#### Create Booking (POST /)
- **Primary:** Writes to `salon.db` with proper schema
- **Legacy:** Also writes to `BookingDb/bookings.db` for backward compatibility
- **Schema Conversion:**
  - Converts `booking_date` + `booking_time` → `start_dt` (ISO timestamp)
  - Calculates `end_dt` using service duration
  - Creates/updates customer in `customers` table
  - Uses `customer_id` and `phone` instead of customer details

#### Get Bookings (GET /)
- **Primary:** Reads from `salon.db`
- **Joins:** Gets service/staff names from salon.db tables
- **Format Conversion:** Converts `start_dt` back to `booking_date` + `booking_time` for frontend compatibility

---

## Database Schema Mapping

### BookingDb Schema → salon.db Schema

| BookingDb Field | salon.db Field | Notes |
|-----------------|----------------|-------|
| `merchant_id` | N/A | salon.db is single-tenant |
| `service_id` | `service_id` | Same |
| `staff_id` | `staff_id` | Same |
| `customer_name` | → `customers.name` | Via `customer_id` |
| `customer_phone` | `phone` | Primary identifier |
| `customer_email` | N/A | Not in salon.db |
| `booking_date` | `DATE(start_dt)` | Converted |
| `booking_time` | `TIME(start_dt)` | Converted |
| `total_price` | Calculated from `services.price` | Joined |
| `party_size` | N/A | Not in salon.db |
| `notes` | N/A | Not in salon.db |
| `status` | `status` | Same values |
| N/A | `hold_until` | For pending bookings |
| N/A | `end_dt` | End timestamp |
| N/A | `reschedule_of` | Booking history |

---

## Testing Results

### Before Fix
```
salon.db: 48 bookings ← WhatsApp bot only
BookingDb: 10 bookings ← Web bookings only
Dashboard: Showed 0 or minimal data ❌
```

### After Fix
```
salon.db: 48+ bookings ← ALL bookings (WhatsApp + Web)
BookingDb: 10+ bookings ← Legacy/backup
Dashboard: Shows real data from 48+ bookings ✅
```

---

## How It Works Now

### 1. Customer Makes Web Booking

```
Frontend → POST /api/bookings
          ↓
   Convert to salon.db schema
          ↓
   Write to salon.db (primary)
          ↓
   Write to BookingDb (legacy backup)
          ↓
   Return confirmation
```

### 2. Dashboard Loads Statistics

```
Dashboard Component
        ↓
GET /api/dashboard/stats/8
        ↓
Query salon.db for bookings
        ↓
Calculate metrics
        ↓
Return real-time data
```

### 3. WhatsApp Bot Makes Booking

```
WhatsApp Message
       ↓
handler.js (bot logic)
       ↓
Writes directly to salon.db
       ↓
Dashboard automatically includes it ✅
```

---

## Benefits

1. **✅ Single Source of Truth:** All bookings in one database
2. **✅ Real-time Dashboard:** Shows WhatsApp + Web bookings combined
3. **✅ No Data Silos:** WhatsApp and Web bookings are unified
4. **✅ Backward Compatible:** Legacy BookingDb still receives copies
5. **✅ Customer Tracking:** Unified customer records via phone number

---

## Important Notes

### Multi-Tenancy Consideration

⚠️ **Current Limitation:** `salon.db` was designed for a single salon (no `merchant_id` field)

For true multi-tenant support with multiple salons, you would need to:
1. Add `merchant_id` column to salon.db bookings table
2. Filter all queries by merchant_id
3. Update the WhatsApp bot to handle multiple merchants

**Current Workaround:** The system treats all bookings as belonging to the logged-in merchant.

### Data Migration

If you need to migrate existing BookingDb bookings to salon.db:

```javascript
// Migration script (run once)
const bookingDbBookings = bookingDb.prepare('SELECT * FROM bookings').all();

bookingDbBookings.forEach(booking => {
  const start_dt = new Date(`${booking.booking_date}T${booking.booking_time}`).toISOString();
  const end_dt = new Date(start_dt).getTime() + (30 * 60000); // 30 min default
  
  salonDb.prepare(`
    INSERT INTO bookings (phone, staff_id, service_id, start_dt, end_dt, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(booking.customer_phone, booking.staff_id, booking.service_id, start_dt, end_dt, booking.status);
});
```

---

## Verification Commands

Check that both databases are connected:

```bash
cd "Combined Frontend/Combined Frontend/backend"
node -e "
const Database = require('better-sqlite3');
const salonDb = new Database('../../../salon.db');
const bookings = salonDb.prepare('SELECT COUNT(*) as count FROM bookings').get();
console.log('salon.db bookings:', bookings.count);
"
```

Expected output: `salon.db bookings: 48+`

---

## Next Steps (Optional)

1. **Remove Legacy BookingDb:** Once confident, stop writing to BookingDb/bookings.db
2. **Add Merchant Field:** Extend salon.db schema to support multiple merchants
3. **Data Cleanup:** Migrate or archive old BookingDb data
4. **Unified Schema:** Standardize all booking fields across the system

---

## Summary

✅ **Problem Solved:** Dashboard and web bookings now use `salon.db`  
✅ **Data Unified:** All bookings (WhatsApp + Web) in one place  
✅ **Real-time Stats:** Dashboard shows accurate booking counts and revenue  
✅ **Future-proof:** Schema conversion layer handles differences  

The merchant portal now correctly displays all booking data from the main `salon.db` database!



