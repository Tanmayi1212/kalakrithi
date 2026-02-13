# Admin Dashboard Setup Guide

Quick setup guide for the Kalakrithi Admin Dashboard system.

## Prerequisites

- Firebase project configured
- Next.js application running
- Node.js v18+ installed

## Installation

Dependencies are already installed. If needed:
```bash
npm install react-hot-toast qrcode recharts
```

## Creating Your First Admin

### Step 1: Create Auth User
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Enter admin email and password
5. Copy the generated **User UID**

### Step 2: Add to Admins Collection
1. Navigate to **Firestore Database**
2. Click **Start Collection**
3. Collection ID: `admins`
4. Document ID: `<paste-user-uid-from-step-1>`
5. Add fields:
   ```
   Field: email
   Type: string
   Value: admin@kalakrithi.com

   Field: role
   Type: string
   Value: admin

   Field: createdAt
   Type: timestamp
   Value: <current-time>
   ```
6. Click **Save**

## Deploy Security Rules

1. Copy rules from `ADMIN_SECURITY_RULES.md`
2. Go to Firebase Console → **Firestore Database** → **Rules**
3. Replace entire content with the new rules
4. Click **Publish**

## Testing the Dashboard

### 1. Start Development Server
```bash
npm run dev
```

### 2. Access Admin Login
Navigate to: `http://localhost:3000/admin/login`

### 3. Login
- Email: Your admin email
- Password: Your admin password

### 4. Verify Access
You should see:
- ✅ Dashboard with sidebar
- ✅ Overview page with stats cards
- ✅ Navigation working

## Creating Test Data

To test the dashboard, you need some pending payments. Create a Cloud Function or manually add to Firestore:

### Manual Test Data
1. Go to Firestore → Create collection `pendingPayments`
2. Add a document with auto-ID:
```javascript
{
  orderId: "ORD001",
  name: "Test Student",
  rollNumber: "CS001",
  phone: "9876543210",
  email: "student@test.com",
  workshopId: "pottery",
  workshopName: "Pottery Workshop",
  slotId: "slot1",
  slotTime: "10:00 AM - 12:00 PM",
  amount: 100,
  transactionId: "TXN123456",
  status: "submitted",
  createdAt: <current-timestamp>
}
```

### Create Workshop with Slots
1. Create collection: `workshops`
2. Document ID: `pottery`
```javascript
{
  name: "Pottery Workshop",
  description: "Hands-on pottery session",
  createdAt: <timestamp>
}
```

3. Create subcollection: `workshops/pottery/slots`
4. Document ID: `slot1`
```javascript
{
  time: "10:00 AM - 12:00 PM",
  maxCapacity: 30,
  isClosed: false
}
```

## Dashboard Features

### Overview Page
- Total workshops count
- Confirmed bookings count
- Pending payments count
- Full slots count
- Workshop bookings chart

### Pending Payments
- View all submitted payments
- Confirm payment (creates booking)
- Reject payment
- Real-time updates

### Confirmed Bookings
- Search by roll number
- Filter by workshop/slot
- Export to CSV
- View/download QR codes

### Slot Management
- View all workshops and slots
- Edit slot capacity
- Open/close slots
- View booking statistics

## Common Issues

### "Permission Denied" Errors
- Ensure user is in `admins` collection
- Check security rules are deployed
- Verify `role` field is exactly "admin"

### Dashboard Not Loading
- Check Firebase configuration in `.env.local`
- Verify all dependencies installed
- Check browser console for errors

### Login Fails
- Verify admin exists in Authentication
- Check admin document exists in Firestore
- Ensure password is correct

## Next Steps

1. ✅ Create your workshops in Firestore
2. ✅ Configure workshop slots
3. ✅ Set up payment submission form for users
4. ✅ Train admins on dashboard usage
5. ✅ Monitor pending payments regularly

## File Structure

```
admin/
├── login/
│   └── page.js                    # Admin login page
├── dashboard/
│   └── page.js                    # Main dashboard
└── layout.js                      # Protected admin layout

src/
├── components/admin/
│   ├── Sidebar.jsx                # Navigation sidebar
│   ├── OverviewCards.jsx          # Dashboard overview
│   ├── PendingPaymentsTable.jsx   # Pending payments management
│   ├── BookingsTable.jsx          # Confirmed bookings
│   └── SlotManager.jsx            # Slot capacity management
└── utils/
    ├── adminAuth.js               # Authentication utilities
    ├── adminService.js            # Firestore operations
    ├── csvExport.js               # CSV export utility
    └── qrGenerator.js             # QR code generation
```

## Support

For detailed information:
- Security Rules: See `ADMIN_SECURITY_RULES.md`
- Implementation Details: See `implementation_plan.md`
- API Reference: Check code comments in utils files
