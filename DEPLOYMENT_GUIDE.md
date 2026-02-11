# 🚀 Deployment & Setup Guide

## Complete Firebase Backend Integration for Kalakrithi × Arangetra

---

## 📁 Project Structure

```
kalakrithi/
├── registrations/              # Cloud Functions codebase
│   ├── index.js               # 3 Cloud Functions (testConnection, createWorkshopBooking, registerForGame)
│   └── package.json
├── src/
│   ├── firebase.js            # Firebase SDK initialization
│   ├── hooks/
│   │   └── useFirebase.js     # React hooks for Cloud Functions
│   └── components/
│       ├── TestConnection.js           # Backend test component
│       ├── WorkshopBookingExample.js   # Workshop booking UI
│       └── GameRegistrationExample.js  # Game registration UI
├── firestore.rules            # Security rules
├── firebase.json              # Firebase configuration
└── .env.local                 # Environment variables
```

---

## ⚙️ Setup Instructions

### 1. Configure Environment Variables

Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Get these from: **Firebase Console → Project Settings → General → Your apps (Web)**

### 2. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Cloud Functions

```bash
# Deploy all functions from registrations codebase
firebase deploy --only functions
```

Or deploy specific functions:

```bash
firebase deploy --only functions:testConnection
firebase deploy --only functions:createWorkshopBooking
firebase deploy --only functions:registerForGame
```

---

## 🗂️ Database Setup

### Create Sample Workshop

In **Firestore Console**, create:

**Collection:** `workshops`  
**Document ID:** `workshop1`

```json
{
  "name": "Traditional Dance Workshop",
  "description": "Learn classical Indian dance forms",
  "price": 299,
  "maxCapacityPerSlot": 4
}
```

**Subcollection:** `workshops/workshop1/slots`  
**Document ID:** `slot1`

```json
{
  "time": "10:00 AM - 12:00 PM",
  "maxCapacity": 4
}
```

**Document ID:** `slot2`

```json
{
  "time": "2:00 PM - 4:00 PM",
  "maxCapacity": 4
}
```

### Create Sample Game

**Collection:** `arangetraGames`  
**Document ID:** `game1`

```json
{
  "name": "Rangoli Competition",
  "description": "Create beautiful rangoli designs"
}
```

---

## 🔧 Cloud Functions API

### 1. `testConnection()`

**Purpose:** Verify backend connectivity

**Request:**
```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/src/firebase';

const testConnection = httpsCallable(functions, 'testConnection');
const result = await testConnection();
```

**Response:**
```json
{
  "success": true,
  "message": "Backend connection successful!",
  "timestamp": "2026-02-11T21:41:20.000Z",
  "authenticated": false
}
```

---

### 2. `createWorkshopBooking()`

**Purpose:** Create workshop booking with transaction safety  
**Authentication:** Required

**Request:**
```javascript
import { createWorkshopBooking } from '@/src/hooks/useFirebase';

const result = await createWorkshopBooking({
  workshopId: 'workshop1',
  slotId: 'slot1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '9876543210',
  rollNumber: 'CS101',
  paymentId: 'PAY_12345'
});
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Workshop booking confirmed successfully!",
    "bookingId": "CS101",
    "workshopName": "Traditional Dance Workshop",
    "slotTime": "10:00 AM - 12:00 PM",
    "remainingSeats": 3
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "This slot is full (4/4 seats taken). Please select another slot."
}
```

**Error Cases:**
- `unauthenticated`: User not signed in
- `invalid-argument`: Missing/invalid fields
- `not-found`: Workshop or slot not found
- `already-exists`: Roll number already registered
- `resource-exhausted`: Slot is full

---

### 3. `registerForGame()`

**Purpose:** Register for free Arangetra game

**Request:**
```javascript
import { registerForGame } from '@/src/hooks/useFirebase';

const result = await registerForGame({
  gameId: 'game1',
  name: 'Jane Doe',
  rollNumber: 'CS102',
  phone: '9876543210'
});
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Successfully registered for Rangoli Competition!",
    "registrationId": "CS102",
    "gameName": "Rangoli Competition"
  }
}
```

**Error Cases:**
- `invalid-argument`: Invalid phone/roll number format
- `not-found`: Game not found
- `already-exists`: Already registered

---

## 🎨 React Integration Examples

### Test Backend Connection

```jsx
import TestConnection from '@/src/components/TestConnection';

export default function Page() {
  return <TestConnection />;
}
```

### Workshop Booking

```jsx
import WorkshopBookingExample from '@/src/components/WorkshopBookingExample';

export default function Page() {
  return <WorkshopBookingExample />;
}
```

### Game Registration

```jsx
import GameRegistrationExample from '@/src/components/GameRegistrationExample';

export default function Page() {
  return <GameRegistrationExample />;
}
```

---

## 🔒 Security Features

### Firestore Rules

✅ **Public read** for workshops, slots, and games  
❌ **No client writes** to bookings or registrations  
✅ **Cloud Functions only** can create bookings/registrations

### Concurrency Protection

All booking operations use **Firestore transactions** which:
- Count bookings inside transaction
- Check capacity atomically
- Prevent race conditions
- Block duplicate rollNumbers (document ID = rollNumber)

### Validation

**Workshop Bookings:**
- Email format validation
- Phone number (10 digits)
- Roll number (alphanumeric)
- All fields required
- Authentication required

**Game Registrations:**
- Phone number (10 digits)
- Roll number (alphanumeric)
- All fields required

---

## 🧪 Testing

### 1. Test Backend Connection

```bash
npm run dev
# Navigate to your test connection page
# Click "Test Connection" button
# Should see success response
```

### 2. Test Workshop Booking

1. Create sample workshop and slots in Firestore
2. Navigate to workshop booking page
3. Select workshop and slot
4. Fill in details
5. Submit booking
6. Verify booking appears in Firestore

### 3. Test Concurrency

Simulate multiple users booking the last seat:

```javascript
// In browser console, run simultaneously in multiple tabs
const result = await createWorkshopBooking({
  workshopId: 'workshop1',
  slotId: 'slot1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  rollNumber: 'TEST' + Math.random(),
  paymentId: 'PAY_TEST'
});
```

Only 4 bookings should succeed, rest should fail with "slot is full" error.

---

## 📊 Monitoring

### View Cloud Function Logs

```bash
firebase functions:log
```

### View Specific Function Logs

```bash
firebase functions:log --only createWorkshopBooking
```

### Real-time Logs

```bash
firebase functions:log --follow
```

---

## 🚨 Common Issues

### "Function not found"
**Solution:** Deploy functions
```bash
firebase deploy --only functions
```

### "Permission denied"
**Solution:** Deploy security rules
```bash
firebase deploy --only firestore:rules
```

### "Unauthenticated" error
**Solution:** Sign in user (anonymous auth enabled in example)
```javascript
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/src/firebase';

await signInAnonymously(auth);
```

### Real-time updates not working
**Solution:** Check Firebase configuration in `.env.local`

---

## 🎯 Production Checklist

- [ ] Add real payment gateway (Razorpay/Stripe)
- [ ] Set up email confirmations
- [ ] Add admin dashboard
- [ ] Enable proper authentication (Email/Password or Google Sign-in)
- [ ] Set up Firebase budget alerts
- [ ] Test under load (concurrent bookings)
- [ ] Add booking cancellation
- [ ] Implement refund logic
- [ ] Add SMS notifications
- [ ] Set up database backups

---

## 📝 Next Steps

1. **Test Connection:** Deploy and test `testConnection()` function
2. **Add Sample Data:** Create workshops and games in Firestore
3. **Test Booking Flow:** Complete a test workshop booking
4. **Test Game Registration:** Register for a test game
5. **Payment Integration:** Integrate Razorpay or Stripe
6. **Deploy to Production:** `firebase deploy`

---

## 🔗 Resources

- [Firebase Functions v2 Docs](https://firebase.google.com/docs/functions/callable)
- [Firestore Transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
