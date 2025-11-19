// backend/Merchantdb/init.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the directory exists
const dbDir = __dirname;
if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'merchant.db');
const db = new Database(dbPath, { verbose: console.log });

db.pragma('foreign_keys = ON');

const createSchema = () => {
    console.log("Creating Merchantdb Schema...");

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
        specialties JSON, 
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
    console.log("✅ Merchantdb tables created successfully.");
};

createSchema();