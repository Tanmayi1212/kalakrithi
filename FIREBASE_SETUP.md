# Firebase Backend Integration Guide

## 🚀 Quick Start

This guide will help you set up Firebase backend integration for the Kalakrithi × Arangetra event website.

---

## 📋 Prerequisites

- Node.js 18 or higher
- Firebase account
- Firebase CLI installed globally: `npm install -g firebase-tools`

---

## 🔧 Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "kalakrithi-arangetra"
3. Enable Firestore Database (Production mode)
4. Enable Authentication (Email/Password provider)

### 2. Get Firebase Configuration

#### For Frontend (Web App Configuration)

1. Go to Project Settings → General
2. Scroll to "Your apps" → Click "Web" icon
3. Register your app
4. Copy the configuration values
5. Update `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### For Cloud Functions (Service Account)

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Add to `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

### 3. Initialize Firebase in Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Select:
# - Firestore
# - Functions (JavaScript)

# Use existing project: kalakrithi-arangetra
```

### 4. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 5. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 6. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

---

## 🗂️ Database Structure

### Workshops Collection

```
workshops (collection)
├── {workshopId} (document)
│   ├── name: string
│   ├── description: string
│   ├── price: number
│   ├── maxCapacityPerSlot: number (4)
│   └── slots (subcollection)
│       └── {slotId} (document)
│           ├── time: string
│           ├── maxCapacity: number (4)
│           └── bookings (subcollection)
│               └── {rollNumber} (document)
│                   ├── name: string
│                   ├── email: string
│                   ├── rollNumber: string
│                   ├── phone: string
│                   ├── paymentId: string
│                   └── createdAt: timestamp
```

### Arangetra Games Collection

```
arangetraGames (collection)
├── {gameId} (document)
│   ├── name: string
│   ├── description: string
│   └── registrations (subcollection)
│       └── {rollNumber} (document)
│           ├── name: string
│           ├── rollNumber: string
│           ├── phone: string
│           └── createdAt: timestamp
```

---

## 🔌 Cloud Functions API

### 1. `createWorkshopBookingOrder`

**Purpose:** Validates booking request before payment

**Input:**
```javascript
{
  workshopId: string,
  slotId: string,
  name: string,
  email: string,
  rollNumber: string,
  phone: string
}
```

**Output:**
```javascript
{
  success: true,
  orderId: string,
  workshopName: string,
  slotTime: string,
  price: number,
  remainingSeats: number
}
```

**Error Cases:**
- Missing fields
- Invalid email/roll number format
- Workshop/slot not found
- Duplicate booking (same roll number already registered)
- Slot is full

---

### 2. `verifyWorkshopPayment`

**Purpose:** Verifies payment and creates booking

**Input:**
```javascript
{
  workshopId: string,
  slotId: string,
  name: string,
  email: string,
  rollNumber: string,
  phone: string,
  paymentId: string
}
```

**Output:**
```javascript
{
  success: true,
  bookingId: string,
  message: string
}
```

**Error Cases:**
- Missing fields
- Workshop/slot not found
- Duplicate booking
- Slot became full during payment

---

### 3. `registerArangetraGame`

**Purpose:** Registers student for free game

**Input:**
```javascript
{
  gameId: string,
  name: string,
  rollNumber: string,
  phone: string
}
```

**Output:**
```javascript
{
  success: true,
  registrationId: string,
  message: string
}
```

**Error Cases:**
- Missing fields
- Invalid roll number/phone format
- Game not found
- Duplicate registration

---

## 🎨 Frontend Integration

### Import Required Hooks

```javascript
import { 
  useWorkshops, 
  useWorkshopSlots, 
  useArangetraGames,
  createWorkshopBookingOrder,
  verifyWorkshopPayment,
  registerForGame 
} from '@/lib/firebaseHooks';
```

### Fetch Workshops with Real-time Updates

```javascript
const { workshops, loading, error } = useWorkshops();
```

### Fetch Slots for a Workshop

```javascript
const [selectedWorkshop, setSelectedWorkshop] = useState(null);
const { slots, loading, error } = useWorkshopSlots(selectedWorkshop?.id);

// Each slot includes:
// - id
// - time
// - maxCapacity
// - bookingCount
// - remainingSeats
// - isFull
```

### Workshop Booking Flow

```javascript
// Step 1: Create order
const orderResult = await createWorkshopBookingOrder({
  workshopId,
  slotId,
  name,
  email,
  rollNumber,
  phone
});

// Step 2: Process payment (integrate your payment gateway)
const paymentId = await yourPaymentGateway(orderResult.data.orderId);

// Step 3: Verify payment
const verifyResult = await verifyWorkshopPayment({
  workshopId,
  slotId,
  name,
  email,
  rollNumber,
  phone,
  paymentId
});
```

### Game Registration

```javascript
const result = await registerForGame({
  gameId,
  name,
  rollNumber,
  phone
});
```

---

## 🔒 Security Features

### Firestore Rules

- ✅ Public read access for workshops, slots, and games
- ❌ No direct client writes to bookings or registrations
- ✅ All writes go through Cloud Functions
- ✅ Transaction-based concurrency protection

### Concurrency Protection

All slot capacity checks use Firestore transactions to prevent:
- Race conditions
- Overbooking
- Duplicate registrations

**Transaction Flow:**
1. Check if workshop/slot exists
2. Count current bookings
3. Validate capacity
4. Check for duplicate roll number
5. Create booking atomically

---

## 📁 File Structure

```
kalakrithi/
├── lib/
│   ├── firebase.js           # Firebase SDK initialization
│   └── firebaseHooks.js      # React hooks for Firebase
├── functions/
│   ├── index.js              # Cloud Functions
│   └── package.json          # Functions dependencies
├── components/
│   └── examples/
│       ├── WorkshopBookingExample.js
│       └── GameRegistrationExample.js
├── firebase.json             # Firebase config
├── firestore.rules          # Security rules
└── .env.local               # Environment variables
```

---

## 🧪 Testing

### Local Development

```bash
# Run Next.js dev server
npm run dev

# Run Firebase emulators (in another terminal)
firebase emulators:start
```

### Testing Cloud Functions Locally

```bash
cd functions
npm run serve
```

---

## 🚀 Deployment

### Deploy Everything

```bash
firebase deploy
```

### Deploy Only Functions

```bash
firebase deploy --only functions
```

### Deploy Only Rules

```bash
firebase deploy --only firestore:rules
```

---

## 📊 Sample Data Setup

### Add Sample Workshop

```javascript
// In Firestore Console
workshops/workshop1
{
  name: "Traditional Dance Workshop",
  description: "Learn classical Indian dance forms",
  price: 299,
  maxCapacityPerSlot: 4
}

// Add slots
workshops/workshop1/slots/slot1
{
  time: "10:00 AM - 12:00 PM",
  maxCapacity: 4
}

workshops/workshop1/slots/slot2
{
  time: "2:00 PM - 4:00 PM",
  maxCapacity: 4
}
```

### Add Sample Game

```javascript
// In Firestore Console
arangetraGames/game1
{
  name: "Rangoli Competition",
  description: "Create beautiful rangoli designs"
}
```

---

## ⚠️ Important Notes

1. **Never write directly to bookings from frontend** - Always use Cloud Functions
2. **Test transactions under load** - Ensure no race conditions
3. **Implement actual payment gateway** - Replace the simulated payment
4. **Monitor Cloud Functions logs** - Check for errors: `firebase functions:log`
5. **Set up Firebase Budget Alerts** - Prevent unexpected costs

---

## 🔗 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Security Rules Reference](https://firebase.google.com/docs/firestore/security/rules-structure)

---

## 🆘 Troubleshooting

### Error: "Missing or insufficient permissions"
- Deploy security rules: `firebase deploy --only firestore:rules`

### Error: "Function not found"
- Deploy functions: `firebase deploy --only functions`
- Check function names match exactly

### Error: "Slot is full" but showing seats available
- Transaction timing issue - this is expected behavior
- Second user gets error if both try to book last seat simultaneously

### Real-time updates not working
- Check Firebase configuration in `.env.local`
- Ensure `onSnapshot` is being used correctly
- Check browser console for errors

---

## 📝 TODO: Production Checklist

- [ ] Set up actual payment gateway (Razorpay/Stripe)
- [ ] Add email confirmation for bookings
- [ ] Implement admin dashboard
- [ ] Add analytics tracking
- [ ] Set up Firebase budget alerts
- [ ] Test under load (simulate concurrent bookings)
- [ ] Add booking cancellation feature
- [ ] Implement refund logic
- [ ] Add SMS notifications
- [ ] Set up backup strategy
