// db.js
// ---------------------------------------------------------------------------
// This file sets up our SQLite database using "better-sqlite3".
// better-sqlite3 is beginner-friendly because it is SYNCHRONOUS:
// you call a function and get the result back immediately (no callbacks,
// no promises, no async/await needed for simple queries).
// ---------------------------------------------------------------------------

const Database = require("better-sqlite3");
const path = require("path");

// Create (or open) a file called "community_hero.db" in the backend folder.
// The first time you run the server this file is created automatically.
const db = new Database(path.join(__dirname, "community_hero.db"));

// "WAL" mode makes reading + writing at the same time smoother.
// Safe to leave on; you don't need to understand the details for the MVP.
db.pragma("journal_mode = WAL");

// ---------------------------------------------------------------------------
// Create the "issues" table if it does not already exist.
// Each civic issue is one row in this table.
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS issues (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    title                  TEXT    NOT NULL,
    description            TEXT    NOT NULL,
    category               TEXT    NOT NULL,
    severity               TEXT    NOT NULL,
    latitude               REAL    NOT NULL,
    longitude              REAL    NOT NULL,
    image_path             TEXT,                       -- optional, can be NULL
    status                 TEXT    NOT NULL DEFAULT 'Reported',
    upvotes                INTEGER NOT NULL DEFAULT 0,
    ai_suggested_category  TEXT,                       -- what the rule-based AI guessed
    created_at             TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
