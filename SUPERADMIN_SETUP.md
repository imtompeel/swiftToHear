# Superadmin Setup Guide

This guide explains how to set up and use the superadmin system for managing email signups.

## Overview

The superadmin system provides an additional layer of security for sensitive operations like viewing email signups. Regular admin users can access the main admin panel, but only superadmins can access email signup data. Superadmins are stored in a dedicated Firebase collection.

## Setup

### 1. Create Superadmin User in Firebase

1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter the superadmin email address and password
4. Click "Add user"
5. Note down the UID of the created user

### 2. Add User to Superadmin Collection

You can add a user to the superadmin collection in several ways:

#### Option A: Using the Browser Console (Recommended for first setup)

1. Sign in to your application with the superadmin user account
2. Open the browser console (F12)
3. Run the following code:

```javascript
import { setupFirstSuperadmin } from './src/utils/setupSuperadmin';
// Replace with the actual UID
await setupFirstSuperadmin('your-user-uid');
```

#### Option B: Direct Firebase Console

1. Go to Firebase Console > Firestore Database
2. Create a new collection called `superadmins`
3. Create a document with the user's UID as the document ID
4. Add the following fields:
   - `uid`: The user's UID (string)
   - `createdAt`: Current timestamp
   - `isActive`: true (boolean)

### 3. Firestore Security Rules

The Firestore rules in `firestore.rules` have been updated to use the superadmin collection:

```javascript
// Only allow superadmins to read email signups
allow read, update, delete: if 
  request.auth != null && 
  exists(/databases/$(database)/documents/superadmins/$(request.auth.uid));

// Superadmin collection - only superadmins can read/write
match /superadmins/{document} {
  allow read, write: if 
    request.auth != null && 
    exists(/databases/$(database)/documents/superadmins/$(request.auth.uid));
}
```

## Usage

### Accessing the Superadmin Panel

1. Navigate to `/superadmin` in your application
2. You'll be redirected to the superadmin login screen
3. Sign in with superadmin credentials
4. You'll see the email signups management interface

### Separate Login System

The superadmin system has its own dedicated login screen with enhanced security features:
- Separate authentication flow
- Access verification against the superadmin collection
- Automatic sign-out if user lacks superadmin privileges

## Security Features

- **Collection-based access**: Only users in the superadmin collection can access email signups
- **Separate login system**: Dedicated superadmin login with enhanced security
- **Access denied protection**: Users without superadmin privileges are automatically signed out
- **Secure routing**: Superadmin routes are protected at the component level
- **Firestore rules**: Database-level protection prevents unauthorized access
- **Automatic verification**: Superadmin status is verified on every login attempt

## File Structure

- `src/services/superadminService.ts` - Superadmin authentication and collection management
- `src/components/SuperadminPanel.tsx` - Superadmin interface for email signups
- `src/components/SuperadminLogin.tsx` - Dedicated superadmin login component
- `src/components/AdminPanel.tsx` - Updated admin panel (no mailing list references)
- `src/utils/setupSuperadmin.ts` - Utility functions for superadmin management
- `firestore.rules` - Updated security rules using superadmin collection

## Troubleshooting

### Access Denied Error

If you're getting access denied errors:

1. Check that your UID exists in the `superadmins` collection in Firestore
2. Verify you're signed in with the correct account
3. Check the browser console for any authentication errors
4. Ensure the `isActive` field is set to `true` in your superadmin document

### Firestore Permission Errors

If you're getting Firestore permission errors:

1. Deploy the updated Firestore rules to Firebase
2. Make sure you're signed in with the superadmin account
3. Verify the superadmin collection exists and contains your UID

## Best Practices

1. **Use strong passwords** for superadmin accounts
2. **Limit superadmin access** to only necessary personnel
3. **Regularly review** the superadmin collection
4. **Monitor access logs** in Firebase Console
5. **Use the utility functions** for managing superadmins
6. **Keep superadmin collection secure** - only superadmins can modify it
