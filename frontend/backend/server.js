const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3'); // Added this
const onboardRoutes = require('./routes/onboard');

const app = express();
const PORT = 5000; // Remember we changed this to 5000

app.use(cors());
app.use(express.json());

// 1. Serve Images Publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Onboarding Routes (Write)
app.use('/api/onboard', onboardRoutes);

// 3. Marketplace Routes (Read) - NEW CODE
const db = new Database(path.join(__dirname, 'Merchantdb/merchant.db'));

// A. Get All Merchants (For the Listing Page)
app.get('/api/merchants', (req, res) => {
    try {
        // Fetch basic info for the cards
        const merchants = db.prepare(`
            SELECT id, slug, name, industry, address, cover_photo_path, timezone 
            FROM merchants 
            ORDER BY created_at DESC
        `).all();
        res.json(merchants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch merchants" });
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
        const services = db.prepare('SELECT * FROM services WHERE merchant_id = ?').all(merchant.id);
        const staff = db.prepare('SELECT * FROM staff WHERE merchant_id = ?').all(merchant.id);
        const hours = db.prepare('SELECT * FROM working_hours WHERE merchant_id = ?').all(merchant.id);

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
        console.error(err);
        res.status(500).json({ error: "Failed to fetch merchant details" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend Server is running on http://localhost:${PORT}`);
});