const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./emails.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTable();
  }
});

// Create emails table
function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Emails table ready');
    }
  });
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Email signup endpoint
app.post('/api/signup', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Insert email into database
  const sql = 'INSERT INTO emails (email) VALUES (?)';
  db.run(sql, [email], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to save email' });
    }
    
    console.log(`Email saved: ${email} (ID: ${this.lastID})`);
    res.json({ 
      success: true, 
      message: 'Email registered successfully',
      id: this.lastID 
    });
  });
});

// Get all emails (for admin purposes)
app.get('/api/emails', (req, res) => {
  const sql = 'SELECT * FROM emails ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch emails' });
    }
    res.json({ emails: rows });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 