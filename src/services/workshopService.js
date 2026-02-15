import {
    collection,
    doc,
    getDocs,
    getDoc,
    onSnapshot,
    runTransaction,
    query,
    where,
    Timestamp,
    writeBatch
} from "firebase/firestore";
import { db } from "@/src/firebase";

// Helper to sanitize data (convert Timestamps to strings)
function sanitizeFirestoreData(data) {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
        const val = sanitized[key];
        if (val && typeof val === 'object' && typeof val.toDate === 'function') {
            sanitized[key] = val.toDate().toString();
        } else if (val && typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val) {
            // Handle raw timestamp objects if not converted by SDK
            sanitized[key] = new Date(val.seconds * 1000).toString();
        }
    });
    return sanitized;
}

/**
 * Get all active workshops
 */
export async function getWorkshops() {
    try {
        const q = query(collection(db, "workshops"), where("isActive", "==", true));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...sanitizeFirestoreData(d.data()) }));
    } catch (error) {
        console.error("Error fetching workshops:", error);
        return [];
    }
}

/**
 * Subscribe to workshop slots (real-time)
 * Listens to the 'slots' subcollection directly
 */
export function subscribeToWorkshopSlots(workshopId, callback) {
    if (!workshopId) return () => { };

    const slotsRef = collection(db, "workshops", workshopId, "slots");

    return onSnapshot(slotsRef, (snapshot) => {
        const slots = snapshot.docs.map(doc => {
            const data = doc.data();
            // Calculate remaining seats based on currentBookings
            const maxCapacity = data.maxCapacity || 4;
            const currentBookings = data.currentBookings || 0;
            const remainingSeats = Math.max(0, maxCapacity - currentBookings);

            return {
                id: doc.id,
                ...sanitizeFirestoreData(data),
                remainingSeats,
                isFull: remainingSeats === 0,
                // Ensure these fields exist with defaults
                maxCapacity,
                currentBookings,
                isClosed: data.isClosed || false
            };
        });

        callback(slots.sort((a, b) => a.id.localeCompare(b.id))); // Sort by ID (e.g. 1000, 1015)
    });
}

/**
 * Create booking (transaction-safe)
 * Path: workshops/{workshopId}/slots/{slotId}/bookings/{bookingId}
 */
/**
 * Check if user is already registered for a workshop (globally across all slots)
 * Returns { exists: boolean, slotId: string | null }
 */
export async function checkDuplicateRegistration(workshopId, rollNumber) {
    try {
        // 1. Get all slots for this workshop
        const slotsRef = collection(db, "workshops", workshopId, "slots");
        const slotsSnapshot = await getDocs(slotsRef);
        const allSlotIds = slotsSnapshot.docs.map(d => d.id);

        console.log(`🔍 Checking duplicates for ${rollNumber} in workshop ${workshopId}`);
        console.log(`   Found ${allSlotIds.length} slots to check:`, allSlotIds);

        // 2. Check each slot for booking using promise.all
        const checkPromises = allSlotIds.map(async (slotId) => {
            const bookingRef = doc(db, "workshops", workshopId, "slots", slotId, "bookings", rollNumber);
            const bookingSnap = await getDocs(query(collection(db, "workshops", workshopId, "slots", slotId, "bookings"), where("__name__", "==", rollNumber)));
            // Note: getDoc(doc(...)) is cleaner but getDocs with query by ID is also fine. Let's use getDoc for better readability.
            // Actually, we can just use getDoc.
            // But wait, the previous code used transaction.get(docRef).
            // Let's use getDoc here.
        });

        // Re-writing with getDoc for clarity
        const checks = await Promise.all(allSlotIds.map(async (slotId) => {
            const bookingRef = doc(db, "workshops", workshopId, "slots", slotId, "bookings", rollNumber);
            const snap = await import("firebase/firestore").then(mod => mod.getDoc(bookingRef));
            return { exists: snap.exists(), slotId };
        }));

        const existing = checks.find(c => c.exists);

        if (existing) {
            console.log(`❌ Duplicate found in slot: ${existing.slotId}`);
            return { exists: true, slotId: existing.slotId };
        }

        console.log("✅ No duplicates found locally.");
        return { exists: false, slotId: null };
    } catch (error) {
        console.error("Error checking for duplicates:", error);
        // Fail safe: return false so we don't block legitimate users if check fails?
        // Or true to be safe? Let's throw to handle in UI.
        throw error;
    }
}
// Note: We need to import getDoc. It was already imported in line 4? Let's check imports.
// Lines 1-11 imports: collection, doc, getDocs, onSnapshot, runTransaction, query, where, Timestamp, writeBatch.
// getDoc is NOT imported. I need to add it to imports or use getDocs with query.

export async function createBooking(workshopId, slotId, bookingData) {
    // ... (rest of the function remains same)
    try {
        // 0. Validate Roll Number Format
        const rollRegex = /^1601\d{8}$/;
        if (!rollRegex.test(bookingData.rollNumber)) {
            console.log("❌ Invalid Roll Number:", bookingData.rollNumber);
            return { success: false, error: "Invalid roll number format" };
        }

        // 1. Fetch all slot IDs for this workshop to check for duplicates allowed
        // We do this outside the transaction to know which paths to check
        const slotsRef = collection(db, "workshops", workshopId, "slots");
        const slotsSnapshot = await getDocs(slotsRef);
        const allSlotIds = slotsSnapshot.docs.map(d => d.id);

        console.log(`🔍 Checking duplicates for ${bookingData.rollNumber} in workshop ${workshopId}`);
        console.log(`   Found ${allSlotIds.length} slots:`, allSlotIds);

        return await runTransaction(db, async (transaction) => {
            // 2. Prepare Duplicate Checks
            // We need to check if this roll number exists in ANY slot of this workshop
            const duplicateCheckPromises = allSlotIds.map(sid => {
                const ref = doc(db, "workshops", workshopId, "slots", sid, "bookings", bookingData.rollNumber);
                return transaction.get(ref);
            });

            // 3. Get target slot and all duplicate check snapshots
            const targetSlotRef = doc(db, "workshops", workshopId, "slots", slotId);

            // Execute all reads
            const results = await Promise.all([
                transaction.get(targetSlotRef),
                ...duplicateCheckPromises
            ]);

            const slotSnap = results[0];
            const bookingSnaps = results.slice(1);

            // 4. Validate Target Slot
            if (!slotSnap.exists()) {
                throw new Error("Slot not found");
            }
            const slotData = slotSnap.data();

            if (slotData.isClosed) {
                throw new Error("This slot is closed");
            }
            if ((slotData.currentBookings || 0) >= (slotData.maxCapacity || 4)) {
                throw new Error("Slot is full");
            }

            // 5. Check for Duplicates
            console.log(`   Checking ${bookingSnaps.length} booking paths...`);
            let duplicateFound = false;
            let existingSlotId = "";

            bookingSnaps.forEach((snap, index) => {
                if (snap.exists()) {
                    duplicateFound = true;
                    existingSlotId = allSlotIds[index];
                    console.log(`❌ Duplicate found in slot: ${existingSlotId}`);
                }
            });

            if (duplicateFound) {
                throw new Error("You have already registered for this workshop.");
            }

            console.log("✅ No duplicates found. Proceeding with booking.");

            // 6. Create booking
            const bookingRef = doc(db, "workshops", workshopId, "slots", slotId, "bookings", bookingData.rollNumber);

            const finalBookingData = {
                ...bookingData,
                workshopId,
                workshopName: bookingData.workshopName || "Workshop",
                slotId,
                slotTime: slotData.time,
                amount: bookingData.amount || slotData.price || 0,
                paymentStatus: "pending",
                createdAt: Timestamp.now()
            };

            transaction.set(bookingRef, finalBookingData);

            // 7. Increment currentBookings
            transaction.update(targetSlotRef, {
                currentBookings: (slotData.currentBookings || 0) + 1
            });

            return { success: true, bookingId: bookingData.rollNumber };
        });
    } catch (error) {
        console.error("BOOKING ERROR:", error);
        return { success: false, error: error.message };
    }
}
