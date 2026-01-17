# Booking System Fix - Summary

## Problem

The web marketplace bookings were failing with "booking failed please try again" error because:

1. **Database Mismatch**: The frontend was fetching services/staff from `merchant.db` (with service IDs 1-10 for different merchants), but the backend was trying to validate and insert them into `salon.db` (which had different service IDs 1-4).

2. **Isolation Risk**: Initially, bookings were going into a separate `bookingDb`, which would have caused double-booking issues between WhatsApp bot bookings and web marketplace bookings.

## Solution

### 1. Made salon.db Multi-Tenant

Added `merchant_id` columns to the following tables in `salon.db`:
- `services` table
- `staff` table  
- `bookings` table

### 2. Created Mapping Tables

Created two new tables in `salon.db`:
- `service_mapping`: Maps merchant.db service IDs → salon.db service IDs
- `staff_mapping`: Maps merchant.db staff IDs → salon.db staff IDs

### 3. Data Migration

Created and ran `scripts/migrate-to-multitenant.js` which:
- Added merchant_id columns to salon.db tables
- Synced all services from merchant.db to salon.db
- Synced all staff from merchant.db to salon.db
- Created ID mappings for proper cross-referencing

### 4. Updated Booking Routes

Modified `routes/bookings.js` to:
- **GET endpoint**: Query bookings from salon.db (with merchant_id filter)
- **POST endpoint**: 
  - Accept merchant service/staff IDs from frontend
  - Map them to salon.db IDs using mapping tables
  - Insert bookings into salon.db (NOT bookingDb)
  - Properly handle customers table

### 5. Updated Server Endpoints

Modified `server.js`:
- `/api/booked-slots`: Now queries salon.db to show real-time availability
- All booking-related endpoints now use salon.db

## Result

✅ **Single Source of Truth**: All bookings (WhatsApp bot + web marketplace) now go into `salon.db`

✅ **No Double Bookings**: Both systems read from and write to the same database

✅ **Proper ID Mapping**: Merchant service/staff IDs are correctly mapped to salon IDs

✅ **Multi-Tenant Support**: Multiple merchants can coexist in salon.db

## Testing

Verified with test bookings:
- Booking ID 52: Alice Johnson - Haircut with John Doe (Dec 28, 2025)
- Booking ID 53: Bob Smith - Hair Dye with Sarah Mary (Dec 28, 2025)

Both bookings:
- ✅ Created successfully via web marketplace
- ✅ Stored in salon.db with correct merchant_id
- ✅ Visible to WhatsApp bot for availability checking
- ✅ Retrievable via API with proper service/staff names

## Database Schema Updates

### Bookings Table (salon.db)
```sql
-- Now includes merchant_id column
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY,
  phone TEXT,
  staff_id INTEGER,
  service_id INTEGER,
  start_dt TEXT,
  end_dt TEXT,
  status TEXT,
  customer_id INTEGER,
  merchant_id INTEGER,  -- NEW
  ...
);
```

### Services Table (salon.db)
```sql
-- Now includes merchant_id column
CREATE TABLE services (
  id INTEGER PRIMARY KEY,
  name TEXT,
  duration_min INTEGER,
  price REAL,
  merchant_id INTEGER,  -- NEW
  ...
);
```

### Staff Table (salon.db)
```sql
-- Now includes merchant_id column
CREATE TABLE staff (
  id INTEGER PRIMARY KEY,
  name TEXT,
  active INTEGER,
  merchant_id INTEGER,  -- NEW
  ...
);
```

### New Mapping Tables
```sql
CREATE TABLE service_mapping (
  merchant_service_id INTEGER PRIMARY KEY,
  salon_service_id INTEGER NOT NULL,
  merchant_id INTEGER NOT NULL
);

CREATE TABLE staff_mapping (
  merchant_staff_id INTEGER PRIMARY KEY,
  salon_staff_id INTEGER NOT NULL,
  merchant_id INTEGER NOT NULL
);
```

## Important Notes

⚠️ **DO NOT** use `bookingDb` anymore - all bookings must go to `salon.db`

⚠️ When adding new merchants, run the migration script to sync their services/staff

⚠️ The WhatsApp bot and web marketplace now share the same availability data

## Files Modified

1. `routes/bookings.js` - Complete rewrite to use salon.db with mappings
2. `server.js` - Updated booked-slots endpoint
3. `scripts/migrate-to-multitenant.js` - New migration script

## Next Steps

If you add new merchants through the onboarding process:
1. The merchant data goes into merchant.db
2. Run `node scripts/migrate-to-multitenant.js` to sync to salon.db
3. OR restart the backend server (could add auto-sync on startup)



