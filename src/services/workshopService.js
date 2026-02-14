import {
    collection,
    doc,
    getDocs,
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
export async function createBooking(workshopId, slotId, bookingData) {
    try {
        return await runTransaction(db, async (transaction) => {
            // 1. Get slot reference
            const slotRef = doc(db, "workshops", workshopId, "slots", slotId);
            const slotSnap = await transaction.get(slotRef);

            if (!slotSnap.exists()) {
                throw new Error("Slot not found");
            }

            const slotData = slotSnap.data();

            // 2. Validation
            if (slotData.isClosed) {
                throw new Error("This slot is closed");
            }

            if ((slotData.currentBookings || 0) >= (slotData.maxCapacity || 4)) {
                throw new Error("Slot is full");
            }

            // 3. Check for duplicate roll number in THIS slot
            // Note: Preventing global duplicates across all slots for a workshop is hard in a scalable way without a dedicated index/collection.
            // For now, we enforce uniqueness within the specific slot booking path which uses rollNumber as ID.
            const bookingRef = doc(db, "workshops", workshopId, "slots", slotId, "bookings", bookingData.rollNumber);
            const bookingSnap = await transaction.get(bookingRef);

            if (bookingSnap.exists()) {
                throw new Error("This User ID/Roll Number is already registered in this slot.");
            }

            // 4. Create booking
            // Ensure all required fields are present
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

            // 5. Increment currentBookings
            transaction.update(slotRef, {
                currentBookings: (slotData.currentBookings || 0) + 1
            });

            return { success: true, bookingId: bookingData.rollNumber };
        });
    } catch (error) {
        console.error("BOOKING ERROR:", error);
        return { success: false, error: error.message };
    }
}
