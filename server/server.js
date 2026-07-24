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

/**
 * Daily.co meeting token endpoint for SFU mode.
 * Set DAILY_API_KEY in the server environment.
 * Client: VITE_VIDEO_PROVIDER=daily and VITE_DAILY_TOKEN_URL=http://localhost:3001/api/daily/token
 */
app.post('/api/daily/token', async (req, res) => {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Daily is not configured. Set DAILY_API_KEY on the server.'
    });
  }

  const { sessionId, userId } = req.body || {};
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  // Daily room names: alphanumeric and hyphens, max 128 chars
  const roomName = String(sessionId)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .slice(0, 128);

  try {
    // Ensure room exists (create if missing)
    let roomUrl;
    const getRoom = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    if (getRoom.ok) {
      const room = await getRoom.json();
      roomUrl = room.url;
    } else {
      const createRoom = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6,
            enable_chat: false,
            start_video_off: false,
            start_audio_off: false
          }
        })
      });

      if (!createRoom.ok) {
        const detail = await createRoom.text();
        console.error('Daily create room failed:', detail);
        return res.status(502).json({ error: 'Failed to create Daily room' });
      }

      const room = await createRoom.json();
      roomUrl = room.url;
    }

    const tokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: userId || undefined,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2
        }
      })
    });

    if (!tokenRes.ok) {
      const detail = await tokenRes.text();
      console.error('Daily token failed:', detail);
      return res.status(502).json({ error: 'Failed to create Daily meeting token' });
    }

    const { token } = await tokenRes.json();
    res.json({ token, roomUrl });
  } catch (error) {
    console.error('Daily token endpoint error:', error);
    res.status(500).json({ error: 'Daily token endpoint failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 