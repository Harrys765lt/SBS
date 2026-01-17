# Quick Start Guide - Fixed SBS Booking System

## 🎯 What Was Fixed

1. ✅ **Services and Staff now show up** in the booking calendar for admin123 account
2. ✅ **Dashboard now displays real booking data** instead of fake numbers
3. ✅ **API endpoints created** to fetch live statistics from the database

## 🚀 How to Start Everything

### Step 1: Start the Backend Server

```bash
cd "Combined Frontend/Combined Frontend/backend"
node server.js
```

**Expected output:** `🚀 Backend Server is running on http://localhost:5000`

### Step 2: Start the Customer Booking Website (Marketplace)

Open a new terminal:

```bash
cd "Combined Frontend/Combined Frontend/Responsive Booking Marketplace"
npm run dev
```

**Access at:** http://localhost:5173 (or the port shown in terminal)

### Step 3: Start the Merchant Dashboard (Portal)

Open another new terminal:

```bash
cd "Combined Frontend/Combined Frontend/Merchant Portal Design"
npm run dev
```

**Access at:** http://localhost:5174 (or the port shown in terminal)

## 📝 Test the Fixes

### Test 1: Verify Services and Staff Show Up

1. Go to the **Customer Booking Website** (localhost:5173)
2. Browse businesses and click on "FEIN Salon" (or any salon)
3. Look at the booking widget on the right side
4. **✅ You should see:**
   - Service dropdown with: Haircut, Hair Color, Wash & Blow Dry, Hair Treatment
   - Staff dropdown with: Any Professional, Aida, Ben
   - Date picker and time slots

### Test 2: Verify Dashboard Shows Real Data

1. Go to the **Merchant Dashboard** (localhost:5174)
2. Login with:
   - Email: `admin123@gmail.com`
   - Password: (your password)
3. You should land on the Dashboard
4. **✅ You should see:**
   - Real numbers in the KPI cards (Today's Bookings, Monthly Bookings, etc.)
   - If there are no bookings yet, you'll see 0s
   - Top Services section showing your actual services

### Test 3: Make a Test Booking

1. On the **Customer Booking Website**:
   - Select FEIN Salon
   - Choose "Haircut" service
   - Select "Aida" as staff
   - Pick tomorrow's date
   - Select any available time slot
   - Fill in your details
   - Complete the booking

2. Go back to the **Merchant Dashboard**:
   - Refresh the page
   - **✅ You should see:**
     - "Today's Bookings" increased by 1
     - "Weekly Revenue" increased by $50
     - The booking appears in the bookings page

## 🔍 Troubleshooting

### Problem: Services/Staff dropdown is empty

**Solution:**
1. Make sure the backend server is running
2. Check that you're logged in as admin123
3. Run this command to verify data exists:
   ```bash
   cd "Combined Frontend/Combined Frontend/backend"
   node check-db.js
   ```
   You should see 4 services and 2 staff members

### Problem: Dashboard shows all zeros

**Solution:**
- This is normal if you haven't made any bookings yet
- Make a test booking through the marketplace
- The dashboard will update with real numbers

### Problem: "Cannot connect to server" error

**Solution:**
1. Verify backend is running on port 5000
2. Check browser console (F12) for error messages
3. Make sure no firewall is blocking localhost:5000

### Problem: Login fails for admin123

**Solution:**
- The password might not be set yet
- Try creating a new account through the signup flow
- Or check the users table in the database

## 📊 Database Locations

- **Merchant Database:** `Combined Frontend/Combined Frontend/backend/Merchantdb/merchant.db`
- **Booking Database:** `Combined Frontend/Combined Frontend/backend/BookingDb/bookings.db`
- **WhatsApp Bot Database:** `salon.db` (in project root)

## 🎨 What Each Part Does

### Customer Booking Website (Marketplace)
- Customers browse salons
- Make bookings
- View services and staff
- Leave reviews

### Merchant Dashboard (Portal)
- Business owners login
- View booking statistics
- Manage calendar
- See reviews
- Update services and staff

### Backend Server
- Handles all API requests
- Connects to databases
- Processes bookings
- Provides statistics

## 💡 Tips

1. **First Time Setup:** If this is your first time, you might want to create a few test bookings to see the dashboard come alive with real data

2. **Multiple Merchants:** The system supports multiple salons. Each merchant has their own dashboard with their own data

3. **Real-time Updates:** After making a booking, refresh the dashboard to see updated statistics

4. **Staff Selection:** When booking, you can choose "Any Professional" or a specific staff member

## 📞 Need Help?

Check these files for more details:
- `FIXES_APPLIED.md` - Detailed technical documentation
- `Combined Frontend/Combined Frontend/backend/server.js` - API endpoints
- Browser Console (F12) - Error messages and debugging info

## ✨ Enjoy Your Fixed Booking System!

Everything should now work smoothly. Services and staff appear correctly, and the dashboard shows real booking data instead of fake numbers.



