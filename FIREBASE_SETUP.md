# Firebase Setup Guide

This guide will help you set up Firebase for the Swift to Hear email signup system.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `swift-to-hear` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## 3. Create Admin User

1. In Authentication, go to "Users" tab
2. Click "Add user"
3. Enter admin email and password
4. Click "Add user"

## 4. Set up Firestore Database

1. In Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## 5. Configure Security Rules

1. In Firestore Database, go to "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write email signups (for the signup form)
    match /emailSignups/{document} {
      allow read, write: if true;
    }
    
    // Only allow authenticated users to read all signups (for admin panel)
    match /emailSignups/{document} {
      allow read: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

## 6. Get Firebase Config

1. In Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and choose "Web"
4. Register app with name: `swift-to-hear-web`
5. Copy the config object

## 7. Update Frontend Config

1. Open `src/firebase/config.ts`
2. Replace the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 8. Install Dependencies

```bash
npm install
```

## 9. Test the System

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test email signup:
   - Go to `http://localhost:3000`
   - Enter an email and submit
   - Check Firebase Console > Firestore Database to see the email

3. Test admin panel:
   - Go to `http://localhost:3000/admin`
   - Login with your admin credentials
   - View all email signups

## 10. Production Security (Important!)

Before deploying to production, update the Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow creating new email signups (no updates/deletes from public)
    match /emailSignups/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

## 11. Environment Variables (Recommended)

For better security, use environment variables:

1. Create `.env.local` file in the root directory:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

2. Update `src/firebase/config.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID
   };
   ```

## Features

✅ **Email Signup Collection** - Stores all email addresses  
✅ **Duplicate Prevention** - Checks for existing emails  
✅ **Admin Authentication** - Secure login for admin panel  
✅ **Real-time Updates** - Live data in admin panel  
✅ **Status Tracking** - Track email status (pending, confirmed, unsubscribed)  
✅ **Date Tracking** - Timestamps for all signups  

## Next Steps

1. Set up email notifications when new signups are added
2. Add email confirmation functionality
3. Integrate with email marketing services (Mailchimp, etc.)
4. Add export functionality for email lists
5. Set up automated email campaigns 