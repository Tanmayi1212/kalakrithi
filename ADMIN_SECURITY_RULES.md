# Admin Dashboard Security Rules

This document contains the required Firestore security rules for the Kalakrithi Admin Dashboard system.

## Overview

The admin dashboard requires specific Firestore security rules to:
- Protect admin-only operations
- Ensure only admins can confirm/reject payments
- Prevent unauthorized access to sensitive data
- Allow public users to submit payment information

## Required Firestore Collections

### 1. `admins/{uid}`
Stores admin user information.

**Schema:**
```javascript
{
  email: string,
  role: "admin",
  createdAt: timestamp
}
```

### 2. `pendingPayments/{paymentId}`
Stores payment submissions awaiting admin verification.

**Schema:**
```javascript
{
  orderId: string,
  name: string,
  rollNumber: string,
  phone: string,
  email: string,
  workshopId: string,
  workshopName: string,
  slotId: string,
  slotTime: string,
  amount: number,
  transactionId: string,
  status: "submitted" | "confirmed" | "rejected",
  createdAt: timestamp,
  confirmedAt?: timestamp,
  confirmedBy?: string,
  rejectedAt?: timestamp,
  rejectedBy?: string
}
```

### 3. `workshops/{workshopId}/slots/{slotId}/bookings/{rollNumber}`
Stores confirmed bookings created by admins.

**Schema:**
```javascript
{
  name: string,
  email: string,
  rollNumber: string,
  phone: string,
  workshopId: string,
  workshopName: string,
  slotId: string,
  slotTime: string,
  amount: number,
  transactionId: string,
  paymentId: string,
  createdAt: timestamp,
  confirmedBy: string,
  confirmedAt: timestamp,
  attendanceMarked: boolean,
  attendanceStatus?: "present" | "absent",
  attendanceMarkedAt?: timestamp,
  attendanceMarkedBy?: string
}
```

---

## Complete Firestore Security Rules

Replace your current `firestore.rules` file with the following:

```javascript
rules_version = '2';

/**
 * Firestore Security Rules for Kalakrithi Admin Dashboard
 * 
 * Security Model:
 * - Public read access for workshops and slots
 * - Users can submit payment information (pendingPayments)
 * - Only admins can confirm/reject payments
 * - Only admins can create bookings
 * - Admins can manage slot capacity
 */

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // ============================================
    // ADMINS COLLECTION
    // ============================================
    match /admins/{uid} {
      // Users can read their own admin document
      allow read: if isAuthenticated() && request.auth.uid == uid;
      
      // Only create via Firebase Console or Admin SDK
      allow write: if false;
    }

    // ============================================
    // PENDING PAYMENTS COLLECTION
    // ============================================
    match /pendingPayments/{paymentId} {
      // Anyone can read (for verification)
      allow read: if true;
      
      // Authenticated users can create pending payments
      allow create: if isAuthenticated() &&
                      request.resource.data.status == "submitted";
      
      // Only admins can update status to confirmed/rejected
      allow update: if isAdmin() &&
                      request.resource.data.status in ['confirmed', 'rejected'] &&
                      (
                        (request.resource.data.status == 'confirmed' &&
                         request.resource.data.keys().hasAll(['confirmedBy', 'confirmedAt'])) ||
                        (request.resource.data.status == 'rejected' &&
                         request.resource.data.keys().hasAll(['rejectedBy', 'rejectedAt']))
                      );
      
      // Only admins can delete
      allow delete: if isAdmin();
    }

    // ============================================
    // WORKSHOPS COLLECTION
    // ============================================
    match /workshops/{workshopId} {
      // Allow everyone to read workshop data
      allow read: if true;
      
      // Only admins can write workshop data
      allow write: if isAdmin();

      // SLOTS SUBCOLLECTION
      match /slots/{slotId} {
        // Allow everyone to read slots
        allow read: if true;
        
        // Only admins can modify slots (capacity, status)
        allow write: if isAdmin();

        // BOOKINGS SUBCOLLECTION
        match /bookings/{rollNumber} {
          // Allow everyone to read bookings (for verification)
          allow read: if true;
          
          // Only admins can create bookings
          allow create: if isAdmin() &&
                          request.resource.data.keys().hasAll([
                            'name', 'email', 'rollNumber', 'phone',
                            'workshopId', 'slotId', 'confirmedBy', 'confirmedAt'
                          ]);
          
          // Only admins can update bookings (for attendance)
          allow update: if isAdmin();
          
          // Only admins can delete bookings
          allow delete: if isAdmin();
        }
      }
    }

    // ============================================
    // ARANGETRA GAMES COLLECTION (from existing rules)
    // ============================================
    match /arangetraGames/{gameId} {
      // Allow everyone to read game data
      allow read: if true;
      
      // Only Cloud Functions (Admin SDK) can create/update/delete games
      allow write: if false;

      // REGISTRATIONS SUBCOLLECTION
      match /registrations/{rollNumber} {
        // Allow everyone to read registrations (for verification)
        allow read: if true;
        
        // All writes handled by Cloud Functions only
        allow write: if false;
      }
    }

    // ============================================
    // DENY ALL OTHER ACCESSES
    // ============================================
    // Any collection not explicitly allowed above is denied by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Deploying Security Rules

### Option 1: Firebase Console (Recommended for Testing)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Replace the content with the rules above
5. Click **Publish**

### Option 2: Firebase CLI (For Production)
```bash
# From your project directory
firebase deploy --only firestore:rules
```

---

## Creating the First Admin User

Since security rules prevent client-side creation of admin users, you must create the first admin manually:

### Method 1: Firebase Console
1. Go to Firebase Console → **Authentication**
2. Create a new user with email/password
3. Copy the User UID
4. Go to **Firestore Database**
5. Create a new document in the `admins` collection:
   - **Document ID**: `<paste-user-uid-here>`
   - **Fields**:
     ```
     email: "admin@kalakrithi.com"
     role: "admin"
     createdAt: <current timestamp>
     ```

### Method 2: Firebase Admin SDK (Node.js Script)
Create a file `create-admin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createAdmin(email, password) {
  try {
    // Create auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true
    });

    // Add to admins collection
    await db.collection('admins').doc(userRecord.uid).set({
      email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Admin user created successfully!');
    console.log('UID:', userRecord.uid);
    console.log('Email:', email);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

// Replace with your admin credentials
createAdmin('admin@kalakrithi.com', 'SecurePassword123!');
```

Run it:
```bash
node create-admin.js
```

---

## Testing Security Rules

### Test 1: Non-Admin Cannot Confirm Payments
```javascript
// This should FAIL
await updateDoc(doc(db, 'pendingPayments', 'payment123'), {
  status: 'confirmed'
});
// Expected: permission-denied error
```

### Test 2: Admin Can Confirm Payments
```javascript
// Login as admin first
await signInAdmin('admin@kalakrithi.com', 'password');

// This should SUCCEED
await updateDoc(doc(db, 'pendingPayments', 'payment123'), {
  status: 'confirmed',
  confirmedBy: auth.currentUser.uid,
  confirmedAt: Timestamp.now()
});
```

### Test 3: Non-Admin Cannot Create Bookings
```javascript
// This should FAIL
await setDoc(doc(db, 'workshops/ws1/slots/slot1/bookings/roll123'), {
  name: 'Test User'
});
// Expected: permission-denied error
```

---

## Security Best Practices

1. **Never share admin credentials** - Keep admin passwords secure
2. **Use strong passwords** - Minimum 12 characters with mixed case, numbers, symbols
3. **Limit admin access** - Only create admin accounts for trusted users
4. **Monitor admin actions** - All actions include `confirmedBy` and `rejectedBy` fields
5. **Regular audits** - Review admin collection periodically
6. **Enable 2FA** - Consider enabling two-factor authentication for admin accounts

---

## Troubleshooting

### Permission Denied Errors

**Problem**: Getting `permission-denied` when trying to perform admin operations

**Solutions**:
1. Verify user is in `admins` collection with `role: "admin"`
2. Check if user is properly authenticated
3. Ensure security rules are deployed
4. Clear browser cache and re-login

### Admin Login Fails

**Problem**: Cannot login with admin credentials

**Solutions**:
1. Verify user exists in Firebase Authentication
2. Check if user document exists in `/admins/{uid}`
3. Ensure `role` field is exactly `"admin"` (lowercase)
4. Check browser console for detailed error messages

---

## Support

For issues or questions:
1. Check the implementation plan in `implementation_plan.md`
2. Review code comments in admin components
3. Check Firebase Console logs for error details
