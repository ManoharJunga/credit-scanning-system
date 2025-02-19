const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/credit_system.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Successfully connected to the SQLite database.');
  }
});

// Create users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    credits INTEGER DEFAULT 20,  -- Start with 20 credits daily
    daily_credit_used INTEGER DEFAULT 0,
    last_reset TEXT DEFAULT CURRENT_DATE  -- Date when credits were last reset
  )
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err.message);
  } else {
    console.log('Users table created or already exists.');
  }
});

// Create credit_requests table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS credit_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    requested_credits INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',  -- Can be 'pending', 'approved', or 'denied'
    request_date TEXT DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating credit_requests table:', err.message);
  } else {
    console.log('Credit requests table created or already exists.');
  }
});

module.exports = db;
