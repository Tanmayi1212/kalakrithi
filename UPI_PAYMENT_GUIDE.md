# 💳 UPI Payment Integration Guide

## Complete Client-Side Payment Flow for Kalakrithi × Arangetra

---

## 🎯 Overview

This implementation provides a **UPI deep link redirect payment flow** for workshop registrations without requiring Cloud Functions.

**⚠️ IMPORTANT SECURITY NOTES:**
- This is a **CLIENT-SIDE** payment flow
- Payments require **MANUAL ADMIN VERIFICATION**
- Does NOT automatically verify payments
- Should be replaced with **server-side verification** (Razorpay/PhonePe API) for production

---

## 📁 File Structure

```
kalakrithi/
├── src/
│   ├── utils/
│   │   └── upiPayment.js           # UPI link generation utilities
│   ├── services/
│   │   └── paymentService.js       # Firestore payment operations
│   ├── components/
│   │   └── WorkshopPaymentFlow.js  # Payment flow component
│   └── firebase.js
├── app/
│   └── payment-status/
│       └── page.js                 # Payment status & transaction ID submission
└── .env.local                      # UPI configuration
```

---

## ⚙️ Configuration

### Environment Variables

Update `.env.local`:

```env
# UPI Payment Configuration
NEXT_PUBLIC_UPI_ID=kalakrithi@upi
NEXT_PUBLIC_UPI_PAYEE_NAME=Kalakrithi
NEXT_PUBLIC_PAYMENT_SUCCESS_URL=http://localhost:3000/payment-status
```

**Important:**
- Replace `kalakrithi@upi` with your actual UPI ID
- Update `NEXT_PUBLIC_UPI_PAYEE_NAME` with your organization name
- Set proper success URL for production

---

## 🔄 Payment Flow

### Step 1: User Fills Registration Form

User selects workshop, slot, and enters details:
- Name
- Email  
- Roll Number
- Phone

### Step 2: Create Pending Payment

When user clicks "Proceed to Pay":

```javascript
const orderId = await createPendingPayment({
  workshopId,
  slotId,
  name,
  email,
  phone,
  rollNumber,
  amount
});
```

Creates document in Firestore:
```
pendingPayments/{orderId}
├── orderId
├── workshopId
├── slotId
├── name
├── email
├── phone
├── rollNumber
├── amount
├── status: "pending"
├── createdAt
└── updatedAt
```

### Step 3: Generate UPI Deep Link

```javascript
const upiLink = createUPILink({
  amount: 500,
  orderId: orderId,
  workshopId: workshopId
});
// Returns: upi://pay?pa=kalakrithi@upi&pn=Kalakrithi&am=500&cu=INR&tn=WKSP-workshop1-abc123
```

### Step 4: Redirect to UPI App

```javascript
openUPIApp(upiLink);
// Opens PhonePe, GPay, Paytm, or other UPI apps
```

### Step 5: User Completes Payment

User completes payment in UPI app (external).

### Step 6: Return to Website

User manually returns to website → automatically redirected to:
```
/payment-status?orderId=abc123
```

### Step 7: Submit Transaction ID

Payment status page shows form:
```
Enter UPI Transaction ID: [input field]
[Submit] button
```

User enters transaction ID from UPI app.

### Step 8: Update Pending Payment

```javascript
await submitTransactionId(orderId, transactionId);
```

Updates Firestore document:
```
pendingPayments/{orderId}
├── ...
├── status: "submitted"
├── transactionId: "123456789012"
└── submittedAt
```

### Step 9: Admin Verification (Manual)

Admin verifies payment in UPI app using transaction ID.

If valid → Admin manually confirms booking.

---

## 🎨 Usage

### Basic Integration

```jsx
import WorkshopPaymentFlow from '@/src/components/WorkshopPaymentFlow';

export default function RegistrationPage() {
  return <WorkshopPaymentFlow />;
}
```

### Payment Status Page

Already created at `/app/payment-status/page.js`

Users automatically redirected after payment initiation.

---

## 🗂️ Firestore Structure

### pendingPayments Collection

```
pendingPayments (collection)
├── {orderId} (document)
│   ├── orderId: "abc-123-def-456"
│   ├── workshopId: "workshop1"
│   ├── slotId: "slot1"
│   ├── name: "John Doe"
│   ├── email: "john@example.com"
│   ├── phone: "9876543210"
│   ├── rollNumber: "CS101"
│   ├── amount: 500
│   ├── status: "pending" | "submitted" | "confirmed" | "failed"
│   ├── transactionId: "123456789012" (optional)
│   ├── createdAt: Timestamp
│   ├── submittedAt: Timestamp (optional)
│   └── updatedAt: Timestamp
```

---

## 🔌 API Reference

### `createUPILink(params)`

Generate UPI payment deep link.

**Parameters:**
```javascript
{
  amount: number,        // Required: Payment amount in INR
  orderId: string,       // Required: Unique order ID
  workshopId: string,    // Required: Workshop ID
  upiId: string,         // Optional: Defaults to env var
  payeeName: string      // Optional: Defaults to env var
}
```

**Returns:** `string` - UPI deep link

**Example:**
```javascript
const link = createUPILink({
  amount: 500,
  orderId: 'abc123',
  workshopId: 'workshop1'
});
// upi://pay?pa=kalakrithi@upi&pn=Kalakrithi&am=500&cu=INR&tn=WKSP-workshop1-abc123
```

---

### `createPendingPayment(data)`

Create pending payment record in Firestore.

**Parameters:**
```javascript
{
  workshopId: string,
  slotId: string,
  name: string,
  email: string,
  phone: string,
  rollNumber: string,
  amount: number
}
```

**Returns:** `Promise<string>` - Order ID

---

### `getPendingPayment(orderId)`

Fetch pending payment by order ID.

**Returns:** `Promise<Object|null>`

---

### `submitTransactionId(orderId, transactionId)`

Submit UPI transaction ID for verification.

**Returns:** `Promise<boolean>`

---

## 🔒 Security Considerations

### Current Limitations

❌ **No automatic payment verification**  
❌ **Relies on user honesty for transaction ID**  
❌ **Requires manual admin verification**  
❌ **No webhook for payment confirmation**  

### Mitigation

✅ **Firestore security rules** prevent direct booking creation  
✅ **Admin dashboard** for payment verification  
✅ **Email notifications** for new payment submissions  
✅ **Transaction ID validation** (format check)  

### For Production

Replace this flow with:
- **Razorpay Payment Gateway** (recommended)
- **PhonePe Payment Gateway API**
- **Paytm Payment Gateway**
- **Stripe UPI** (international fallback)

These provide:
- Automatic payment verification
- Webhook callbacks
- Refund handling
- Fraud detection

---

## 📱 UPI App Support

**Supported Apps:**
- Google Pay (GPay)
- PhonePe
- Paytm
- Amazon Pay
- BHIM
- Any UPI-enabled app

**Detection:**
- Automatically detects mobile devices
- Shows fallback for desktop browsers
- Handles app-not-found scenarios

---

## 🧪 Testing

### Test Flow

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to payment flow:**
   ```
   http://localhost:3000/your-payment-page
   ```

3. **Fill form and click "Proceed to Pay"**

4. **For mobile:**
   - UPI app will open
   - Complete test payment

5. **For desktop:**
   - Shows instructions
   - Redirects to status page

6. **Enter transaction ID:**
   - Any 12-digit number for testing
   - Submit to mark as "submitted"

### Test Data

```javascript
// Pending payment
{
  name: "Test User",
  email: "test@example.com",
  phone: "9876543210",
  rollNumber: "TEST001",
  amount: 500
}

// Transaction ID (for testing)
transactionId: "123456789012"
```

---

## 🚀 Migration to Production Gateway

When ready to move to Razorpay/PhonePe:

### 1. Keep Firestore structure (compatible)

### 2. Replace `createUPILink()` with gateway SDK:

**Before:**
```javascript
const upiLink = createUPILink({ amount, orderId, workshopId });
openUPIApp(upiLink);
```

**After (Razorpay):**
```javascript
const order = await razorpay.createOrder({ amount, orderId });
razorpay.open(order);
```

### 3. Add webhook handler:

```javascript
// Cloud Function
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  const { orderId, transactionId, status } = req.body;
  
  if (status === 'success') {
    await updatePaymentStatus(orderId, 'confirmed');
    await createWorkshopBooking(orderId); // Auto-create booking
  }
});
```

### 4. Remove manual transaction ID submission

Payment status page becomes read-only.

---

## 📊 Admin Dashboard (TODO)

Create admin panel to:
- View pending payments
- Verify transaction IDs in UPI app
- Confirm/reject payments
- Create bookings for verified payments
- Send email confirmations

**Example Admin Query:**
```javascript
const pendingRef = collection(db, 'pendingPayments');
const q = query(pendingRef, where('status', '==', 'submitted'));
const snapshot = await getDocs(q);
```

---

## ✅ Features

✅ UPI deep link generation  
✅ Mobile app auto-detection  
✅ Pending payment tracking  
✅ Transaction ID submission  
✅ Real-time status updates  
✅ Responsive UI  
✅ Loading states  
✅ Error handling  
✅ Amount validation  
✅ Easy migration path to Razorpay  

---

## 🆘 Troubleshooting

### UPI app doesn't open

**Cause:** Desktop browser or app not installed

**Solution:** Show fallback instructions or QR code

### Transaction ID not accepted

**Cause:** Invalid format

**Solution:** Validate format (8-20 characters, alphanumeric)

### Payment not found

**Cause:** Invalid order ID in URL

**Solution:** Check URL parameters, ensure orderId is passed correctly

---

## 📖 Next Steps

1. ✅ Test payment flow on mobile device
2. ✅ Create sample workshops in Firestore
3. ✅ Test transaction ID submission
4. ⏳ Build admin verification dashboard
5. ⏳ Add email notifications
6. ⏳ Integrate Razorpay for production

---

See `WorkshopPaymentFlow.js` for complete implementation.
