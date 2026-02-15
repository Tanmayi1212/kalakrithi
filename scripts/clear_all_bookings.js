var admin = require("firebase-admin");
var { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin
var serviceAccount = require("./service-account.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

var db = getFirestore();

async function clearAllBookings() {
    console.log("🚀 Starting Data Cleanup...");

    try {
        // 1. Clear 'totalcountworkshops' collection
        console.log("1. Clearing 'totalcountworkshops'...");
        const countsSnapshot = await db.collection("totalcountworkshops").get();
        if (!countsSnapshot.empty) {
            const batch = db.batch();
            countsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`   -> Deleted ${countsSnapshot.size} count documents.`);
        } else {
            console.log("   -> No count documents found.");
        }

        // 2. Iterate Workshops & Slots to clear bookings & reset counters
        console.log("2. Clearing bookings and resetting slots...");
        const workshopsSnapshot = await db.collection("workshops").get();

        for (const workshopDoc of workshopsSnapshot.docs) {
            console.log(`   Processing Workshop: ${workshopDoc.id}`);
            const slotsSnapshot = await workshopDoc.ref.collection("slots").get();

            if (slotsSnapshot.empty) continue;

            // Process slots in batches to avoid memory issues if many
            for (const slotDoc of slotsSnapshot.docs) {
                // A. Delete 'bookings' subcollection
                // Note: Standard delete() doesn't recursive delete subcollections. 
                // We must fetch and delete manually.
                const bookingsSnapshot = await slotDoc.ref.collection("bookings").get();

                if (!bookingsSnapshot.empty) {
                    const bookingBatch = db.batch();
                    bookingsSnapshot.docs.forEach(b => bookingBatch.delete(b.ref));
                    await bookingBatch.commit();
                    console.log(`      -> Cleared ${bookingsSnapshot.size} bookings in slot ${slotDoc.id}`);
                }

                // B. Reset slot counters
                await slotDoc.ref.update({
                    currentBookings: 0,
                    remainingSeats: slotDoc.data().maxCapacity || 4
                });
            }
        }

        console.log("✅ Data Cleanup Complete!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Cleanup Failed:", error);
        process.exit(1);
    }
}

clearAllBookings();
