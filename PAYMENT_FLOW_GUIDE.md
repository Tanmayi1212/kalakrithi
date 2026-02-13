# Workshop Registration Flow - QR Code & Screenshot Upload

## What Was Changed

I've **enabled the complete payment flow** in your workshop registration system. Previously, the registration was **skipping the payment step** entirely and creating bookings without payment screenshots.

### Changes Made

#### Fixed Registration Flow
**File:** `app/register/workshops/page.js`

**Before:**
```javascript
async function handleDetailsSubmit(e) {
    // ... validation ...
    
    // Create booking directly (skip payment screenshot for now)
    const result = await createBooking(
        selectedWorkshop.id,
        selectedSlot.id,
        {
            ...formData,
            paymentScreenshot: null, // No screenshot
        }
    );
    
    if (result.success) {
        setStep("complete"); // Jump directly to completion
    }
}
```

**After:**
```javascript
async function handleDetailsSubmit(e) {
    // ... validation ...
    
    // Proceed to payment step instead of creating booking directly
    setStep("payment");
    toast.success("Details saved! Please complete payment.");
}
```

## How The Flow Works Now

### Step 1: Workshop & Slot Selection
1. Student selects a workshop from available options
2. Student selects an available time slot
3. System shows real-time seat availability

### Step 2: Student Details
Student fills in registration form:
- Full Name
- Roll Number  
- Email
- Phone Number

Form includes validation:
- Email must be valid format
- Phone must be 10 digits
- All fields are required

### Step 3: Payment (NOW ENABLED!)

When student clicks "Proceed to Payment →", they see:

**Payment Summary:**
- Workshop name
- Selected time slot
- Student name
- Amount to pay

**QR Code:**
- Displays at `/public/qr/payment-qr.svg`
- Currently a placeholder - you can replace it with your actual UPI QR code
- Located at: `c:\Users\nalab\OneDrive\Desktop\kalakrithi\public\qr\payment-qr.svg`

**Screenshot Upload:**
- Drag-and-drop or click to upload
- Validates: Images only, max 5MB
- Shows preview after selection
- Compresses image before upload
- **Uploads to Google Drive** (using the credentials you configured)
- Upload progress indicator

### Step 4: Booking Creation

When student clicks "Complete Registration":

1. ✅ Screenshot compresses (max 1200px width, 80% quality)
2. ✅ Uploads to Google Drive via `/api/upload` API route
3. ✅ Gets public Drive URL back
4. ✅ Creates booking in Firestore with:
   ```javascript
   {
       name: "...",
       rollNumber: "...",
       email: "...",
       phone: "...",
       paymentScreenshot: "https://drive.google.com/uc?export=view&id=...",
       workshopId: "...",
       slotId: "...",
       slotTime: "...",
       workshopName: "...",
       amount: 100,
       createdAt: Timestamp,
       paymentStatus: "pending"
   }
   ```

### Step 5: Confirmation

Student sees success message:
- "Registration Successful!"
- Shows workshop and slot details
- Shows "⏳ Your payment is pending admin verification"
- Option to register for another workshop

## Testing Instructions

### 1. Open Workshop Registration

Navigate to:
```
http://localhost:3000/register/workshops
```

### 2. Complete Registration Flow

1. **Select Workshop**: Click on any active workshop
2. **Select Slot**: Choose an available time slot
3. **Fill Details**:
   - Name: Test Student
   - Roll Number: TEST001
   - Email: test@example.com
   - Phone: 1234567890
4. **Click**: "Proceed to Payment →"

### 3. Verify Payment Step

You should now see:
- ✅ Back button to return to details
- ✅ "Complete Payment" header with QR icon
- ✅ Payment summary (workshop, slot, student, amount)
- ✅ **QR Code image** displayed
- ✅ "Upload Payment Screenshot" section with upload area

### 4. Test Screenshot Upload

1. **Click** the upload area or drag an image
2. **Select** a test image (any image < 5MB)
3. **Verify**:
   - ✅ Preview appears
   - ✅ "X" button to remove
   - ✅ Success toast appears
4. **Click**: "Complete Registration" button
5. **Watch**:
   - ✅ Progress screen appears
   - ✅ Upload progress bar (10% → 90% → 100%)
   - ✅ "Processing..." message

### 5. Check Results

#### In Browser:
- ✅ Success screen shows
- ✅ Message: "Registration successful! Awaiting admin confirmation"
- ✅ Booking details displayed

#### In Browser Console:
Look for logs:
```
📤 Uploading payment screenshot for: TEST001
📄 Original file: {...}
🔄 Compressing image...
✅ Compressed to: {...} KB
📍 Uploading to Google Drive...
✅ Upload complete!
🔗 Drive URL: https://drive.google.com/uc?export=view&id=...
```

#### In Google Drive:
- Open your configured folder
- File should be named: `TEST001_{timestamp}.jpg`
- File should be publicly accessible

#### In Firestore:
Navigate to:
```
workshops/{workshopId}/slots/{slotId}/bookings/TEST001
```

Check fields:
- `paymentScreenshot`: Should contain full Google Drive URL
- `paymentStatus`: Should be `"pending"`
- All other fields populated correctly

## Replacing the QR Code

The current QR code at `/public/qr/payment-qr.svg` is a placeholder.

### To Replace with Your UPI QR:

**Option 1: Use an existing QR image**
1. Generate your UPI QR code (using any UPI app)
2. Save as PNG or SVG
3. Replace `c:\Users\nalab\OneDrive\Desktop\kalakrithi\public\qr\payment-qr.svg`
4. Keep the same filename

**Option 2: Generate programmatically**

Create a script using the `qrcode` package (already installed):

```javascript
const QRCode = require('qrcode');
const fs = require('fs');

// Your UPI ID
const upiId = 'yourname@paytm'; // Replace with your UPI ID
const name = 'Kalakrithi';
const amount = ''; // Leave empty for dynamic amount

const upiString = `upi://pay?pa=${upiId}&pn=${name}`;

QRCode.toFile('./public/qr/payment-qr.png', upiString, {
    width: 400,
    margin: 2
}, function (err) {
    if (err) throw err;
    console.log('QR Code generated!');
});
```

Then update the image path in `page.js` line 378:
```javascript
<img
    src="/qr/payment-qr.png"  // Changed from .svg to .png
    alt="Payment QR Code"
    className="w-64 h-auto mx-auto mb-4"
/>
```

## Summary

✅ **Payment flow is now ACTIVE**
✅ **QR code displays on payment step**
✅ **Screenshot upload works with Google Drive**
✅ **Bookings created with pending status**
✅ **Admin dashboard will show Drive URLs automatically**

The registration now follows the complete flow:
**Workshop Selection → Slot Selection → Details → Payment + QR + Screenshot → Booking → Pending Approval**

Everything else (Firestore structure, admin dashboard, slot management) remains **completely unchanged** as required.
