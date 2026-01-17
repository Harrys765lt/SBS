// frontend/backend/server.js — Frontend Backend Server
// PORT: 5000
// DATABASE: frontend/backend/Merchantdb/merchant.db ONLY
// USAGE: Marketplace merchant listings, onboarding
// DO NOT USE salon.db - that's for backend/server.js (port 3000)

const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const onboardRoutes = require('./routes/onboard');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 1. Serve Images Publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Onboarding Routes (Write)
app.use('/api/onboard', onboardRoutes);

// 3. Marketplace Routes (Read) - Uses merchant.db ONLY
const dbPath = path.join(__dirname, 'Merchantdb/merchant.db');
let db;

// Initialize database connection with error handling
try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Verify merchants table exists, if not create it inline
    try {
        db.prepare('SELECT COUNT(*) FROM merchants').get();
        console.log('✅ merchant.db connected - merchants table exists');
    } catch (err) {
        console.warn('⚠️ Merchants table not found. Creating database schema...');
        
        // Create schema inline
        db.exec(`
            CREATE TABLE IF NOT EXISTS merchants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                industry TEXT,
                address TEXT,
                timezone TEXT,
                logo_path TEXT,
                cover_photo_path TEXT,
                about TEXT,
                policies_info TEXT,
                cancellation_policy TEXT,
                deposit_required INTEGER DEFAULT 0,
                break_duration INTEGER DEFAULT 15,
                book_ahead_days INTEGER DEFAULT 30,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                merchant_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                duration INTEGER,
                price REAL,
                description TEXT,
                FOREIGN KEY (merchant_id) REFERENCES merchants (id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS staff (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                merchant_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                bio TEXT,
                specialties TEXT,
                photo_path TEXT,
                FOREIGN KEY (merchant_id) REFERENCES merchants (id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS working_hours (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                merchant_id INTEGER NOT NULL,
                day_of_week TEXT NOT NULL,
                is_open INTEGER DEFAULT 1,
                open_time TEXT,
                close_time TEXT,
                FOREIGN KEY (merchant_id) REFERENCES merchants (id) ON DELETE CASCADE
            );
        `);
        console.log('✅ Database schema created');
    }
} catch (err) {
    console.error('❌ Failed to connect to merchant.db:', err);
    console.error('Database path:', dbPath);
    process.exit(1);
}

// A. Get All Merchants (For the Listing Page)
app.get('/api/merchants', (req, res) => {
    try {
        // Fetch basic info for the cards
        const merchants = db.prepare(`
            SELECT id, slug, name, industry, address, cover_photo_path, timezone 
            FROM merchants 
            ORDER BY created_at DESC
        `).all();
        res.json(merchants || []);
    } catch (err) {
        console.error('Error fetching merchants:', err);
        res.status(500).json({ error: "Failed to fetch merchants", details: err.message });
    }
});

// B. Get Single Merchant Details (For the Profile Page)
app.get('/api/merchants/:slug', (req, res) => {
    try {
        const slug = req.params.slug;
        const merchant = db.prepare('SELECT * FROM merchants WHERE slug = ?').get(slug);

        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        // Fetch nested data
        const services = db.prepare('SELECT * FROM services WHERE merchant_id = ?').all(merchant.id) || [];
        const staff = db.prepare('SELECT * FROM staff WHERE merchant_id = ?').all(merchant.id) || [];
        const hours = db.prepare('SELECT * FROM working_hours WHERE merchant_id = ?').all(merchant.id) || [];

        // Clean up Staff JSON (specialties is stored as string)
        const cleanedStaff = staff.map(s => ({
            ...s,
            specialties: s.specialties ? JSON.parse(s.specialties) : []
        }));

        res.json({
            ...merchant,
            services,
            staff: cleanedStaff,
            hours
        });
    } catch (err) {
        console.error('Error fetching merchant details:', err);
        res.status(500).json({ error: "Failed to fetch merchant details", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Frontend Backend Server is running on http://localhost:${PORT}`);
    console.log(`📁 Using database: ${dbPath}`);
    console.log(`✅ Ready to serve marketplace (merchant.db only)`);
});