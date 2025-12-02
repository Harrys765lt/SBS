// backend/routes/onboard.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const router = express.Router();
// Connect to the database file we created in Step 4
const db = new Database(path.join(__dirname, '../Merchantdb/merchant.db'));

// Setup image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const createSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

router.post('/submit', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 }
]), (req, res) => {
    try {
        const data = JSON.parse(req.body.data); 
        // Normalize paths for Windows/Mac compatibility
        const logoPath = req.files['logo'] ? 'uploads/' + req.files['logo'][0].filename : null;
        const coverPath = req.files['cover_photo'] ? 'uploads/' + req.files['cover_photo'][0].filename : null;
        const slug = createSlug(data.name) + '-' + Date.now(); 

        const insertTransaction = db.transaction(() => {
        
        // A. Insert Merchant (Added break_duration and book_ahead)
        const stmtMerchant = db.prepare(`
            INSERT INTO merchants (
                slug, name, industry, address, timezone, 
                logo_path, cover_photo_path, 
                about, policies_info, cancellation_policy, deposit_required,
                break_duration, book_ahead_days
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmtMerchant.run(
            slug, 
            data.name, 
            data.industry, 
            data.address, 
            data.timezone,
            logoPath, 
            coverPath,
            data.about, 
            data.policies, 
            data.cancellationPolicy, 
            data.depositRequired ? 1 : 0,
            data.breakTime, // Read from frontend
            data.bookAhead  // Read from frontend
        );
        
        const merchantId = info.lastInsertRowid;

        // B. Insert Services
        const stmtService = db.prepare(`
            INSERT INTO services (merchant_id, name, duration, price, description)
            VALUES (?, ?, ?, ?, ?)
        `);
        for (const service of data.services) {
            stmtService.run(merchantId, service.name, service.duration, service.price, service.description);
        }

        // C. Insert Staff
        const stmtStaff = db.prepare(`
            INSERT INTO staff (merchant_id, name, bio, specialties)
            VALUES (?, ?, ?, ?)
        `);
        for (const member of data.staff) {
            stmtStaff.run(
                merchantId, 
                member.name, 
                member.bio, 
                JSON.stringify(member.services || [])
            );
        }

        // D. Insert Working Hours (Now reads REAL data)
        const stmtHours = db.prepare(`
            INSERT INTO working_hours (merchant_id, day_of_week, is_open, open_time, close_time)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            const dayData = data.workingHours[day];
            if (dayData) {
                stmtHours.run(
                    merchantId, 
                    day, 
                    dayData.open ? 1 : 0, 
                    dayData.start, 
                    dayData.end
                );
            }
        });

        return { merchantId, slug };
    });

        const result = insertTransaction();
        res.json({ success: true, ...result });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;