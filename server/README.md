# Swift to Hear - Email Signup Server

A simple Express.js server to handle email signups for the Swift to Hear platform.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Email Signup
- **POST** `/api/signup`
- Body: `{ "email": "user@example.com" }`
- Returns success/error message

### View All Emails (Admin)
- **GET** `/api/emails`
- Returns all registered emails

## Database

Uses SQLite database (`emails.db`) with a simple table:
- `id` - Auto-incrementing primary key
- `email` - Unique email address
- `created_at` - Timestamp

## Features

- ✅ Email validation
- ✅ Duplicate email prevention
- ✅ SQLite database storage
- ✅ CORS enabled for frontend
- ✅ Error handling
- ✅ Admin endpoint to view emails

## Next Steps

1. Add email confirmation functionality
2. Implement email marketing integration
3. Add admin authentication
4. Set up email notifications 