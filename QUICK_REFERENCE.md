# 🚀 Quick Reference: Firebase Integration

## 📦 Installation Commands

```bash
# Install Firebase dependencies
npm install firebase firebase-admin

# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy functions
cd functions && npm install && cd ..
firebase deploy --only functions

# Deploy security rules
firebase deploy --only firestore:rules
```

---

## 🔑 Environment Variables Required

Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## 🎯 Essential Hooks

```javascript
// Get all workshops
const { workshops, loading, error } = useWorkshops();

// Get slots for a workshop
const { slots, loading, error } = useWorkshopSlots(workshopId);

// Get all games
const { games, loading, error } = useArangetraGames();

// Create booking order
const result = await createWorkshopBookingOrder({ workshopId, slotId, name, email, rollNumber, phone });

// Verify payment
const result = await verifyWorkshopPayment({ workshopId, slotId, name, email, rollNumber, phone, paymentId });

// Register for game
const result = await registerForGame({ gameId, name, rollNumber, phone });
```

---

## 📊 Database Schema

**workshops/{workshopId}/slots/{slotId}/bookings/{rollNumber}**
- Booking document ID = rollNumber (prevents duplicates)

**arangetraGames/{gameId}/registrations/{rollNumber}**
- Registration document ID = rollNumber (prevents duplicates)

---

## ⚡ Key Features

✅ Real-time slot availability updates  
✅ Transaction-based concurrency protection  
✅ No direct client writes (all through Cloud Functions)  
✅ Automatic duplicate prevention  
✅ Capacity enforcement  

---

## 🔒 Security

- Public read for workshops, slots, games
- All writes restricted to Cloud Functions
- Firestore transactions prevent race conditions
- Roll number used as document ID prevents duplicates

---

## 📁 Files Created

```
kalakrithi/
├── lib/
│   ├── firebase.js                    # Firebase SDK config
│   └── firebaseHooks.js               # React hooks
├── functions/
│   ├── index.js                       # Cloud Functions
│   ├── package.json                   # Dependencies
│   └── .gitignore
├── components/examples/
│   ├── WorkshopBookingExample.js      # Workshop UI
│   └── GameRegistrationExample.js     # Game UI
├── firebase.json                      # Firebase config
├── .firebaserc                        # Project mapping
├── firestore.rules                    # Security rules
├── FIREBASE_SETUP.md                  # Full documentation
└── QUICK_REFERENCE.md                 # This file
```

---

## 🎬 Complete Workshop Booking Flow

```javascript
// 1. User selects workshop and slot
const { slots } = useWorkshopSlots(workshopId);

// 2. User fills form and clicks "Proceed to Pay"
const order = await createWorkshopBookingOrder({
  workshopId,
  slotId,
  name,
  email,
  rollNumber,
  phone
});

// 3. Process payment with your gateway
const paymentId = await processPayment(order.data.price);

// 4. Verify payment and create booking
const booking = await verifyWorkshopPayment({
  workshopId,
  slotId,
  name,
  email,
  rollNumber,
  phone,
  paymentId
});
```

---

## 📝 TODO Before Production

- [ ] Add your Firebase project credentials to `.env.local`
- [ ] Update `firebase.json` with your project ID
- [ ] Deploy Cloud Functions: `firebase deploy --only functions`
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Add sample workshops and games to Firestore
- [ ] Integrate payment gateway (Razorpay/Stripe)
- [ ] Test concurrent bookings
- [ ] Set up email notifications

---

## 🆘 Common Issues

**"Function not found"**
→ Run: `firebase deploy --only functions`

**"Permission denied"**
→ Run: `firebase deploy --only firestore:rules`

**Real-time updates not working**
→ Check `.env.local` Firebase configuration

---

See **FIREBASE_SETUP.md** for complete documentation.
