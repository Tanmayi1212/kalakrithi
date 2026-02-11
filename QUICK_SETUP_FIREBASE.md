# 🔥 Quick Firebase Setup for Kalakrithi

## ⚠️ CRITICAL: You Need to Add Sample Data to Firestore!

Your workshop registration page can't show anything because **there's no data in Firestore yet**.

---

## 📋 Step 1: Configure Firebase (REQUIRED)

Your `.env.local` still has placeholder values. You need to:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `kalakrithixarangetra`
3. **Go to Project Settings** (gear icon)
4. **Scroll to "Your apps"** → Select **Web app**
5. **Copy your config values**

### Update `.env.local`:

Replace the placeholders with your actual values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...  # Your actual API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kalakrithixarangetra.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kalakrithixarangetra
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kalakrithixarangetra.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# Also update UPI ID
NEXT_PUBLIC_UPI_ID=yourname@upi  # Replace with your actual UPI ID!
```

---

## 📦 Step 2: Add Sample Workshop Data

### Option A: Firebase Console (Easiest)

1. Go to **Firestore Database** in Firebase Console
2. Click **Start collection**
3. Collection ID: `workshops`
4. Click **Next**

**Document 1:**
- Document ID: `workshop1`
- Fields:
  ```
  name: "Traditional Dance Workshop"
  description: "Learn classical Indian dance forms"
  price: 500
  maxCapacityPerSlot: 4
  ```

5. **Add Subcollection** to `workshop1`:
   - Subcollection ID: `slots`
   
   **Slot Document 1:**
   - Document ID: `slot1`
   - Fields:
     ```
     time: "10:00 AM - 12:00 PM"
     maxCapacity: 4
     ```
   
   **Slot Document 2:**
   - Document ID: `slot2`
   - Fields:
     ```
     time: "2:00 PM - 4:00 PM"
     maxCapacity: 4
     ```

6. Repeat for more workshops!

### Option B: Using Code

Create a setup script:

```javascript
// scripts/addSampleData.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "kalakrithixarangetra",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSampleWorkshops() {
  // Workshop 1
  await setDoc(doc(db, 'workshops', 'workshop1'), {
    name: 'Traditional Dance Workshop',
    description: 'Learn classical Indian dance forms',
    price: 500,
    maxCapacityPerSlot: 4
  });

  // Slots for workshop 1
  await setDoc(doc(db, 'workshops/workshop1/slots', 'slot1'), {
    time: '10:00 AM - 12:00 PM',
    maxCapacity: 4
  });

  await setDoc(doc(db, 'workshops/workshop1/slots', 'slot2'), {
    time: '2:00 PM - 4:00 PM',
    maxCapacity: 4
  });

  console.log('Sample data added!');
}

addSampleWorkshops();
```

---

## 🧪 Step 3: Test Your Registration Flow

1. **Restart dev server** (to load new env vars):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Navigate to**: http://localhost:3000/register/workshop

3. **You should now see**:
   - ✅ Workshop cards with names and prices
   - ✅ Time slot selection
   - ✅ Registration form
   - ✅ Payment button

---

## 🚨 Common Issues

### "No workshops available"
**Cause**: No data in Firestore  
**Solution**: Add sample workshops (see Step 2)

### "Loading forever"
**Cause**: Firebase config not set or wrong  
**Solution**: Check `.env.local` has actual values, restart dev server

### "Permission denied"
**Cause**: Firestore rules not deployed  
**Solution**: 
```bash
firebase deploy --only firestore:rules
```

### UPI payment doesn't work
**Cause**: UPI ID not configured  
**Solution**: Set `NEXT_PUBLIC_UPI_ID` in `.env.local`

---

## ✅ Quick Checklist

- [ ] Updated `.env.local` with real Firebase credentials
- [ ] Restarted dev server (`npm run dev`)
- [ ] Added sample workshops in Firestore Console
- [ ] Added slots to workshops
- [ ] Set your UPI ID in `.env.local`
- [ ] Tested workshop registration page

---

## 📖 What Should Work Now

1. **Workshop Selection** - See all workshops from Firestore
2. **Slot Selection** - See available time slots with live seat count
3. **Real-time Updates** - Seat availability updates automatically
4. **Payment Flow** - Complete UPI payment redirect
5. **Transaction Tracking** - Submit transaction ID after payment

---

## 🎯 Next Steps

Once data is added and you see workshops:

1. **Test booking flow** on mobile device
2. **Verify UPI redirect** works
3. **Check payment status page**
4. **Build admin dashboard** to verify payments

---

**Need help?** Check if Firebase is configured correctly:
1. Look for errors in browser console (F12)
2. Check Network tab for failed requests
3. Verify Firestore has data in Firebase Console
