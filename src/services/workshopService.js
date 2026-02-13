import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    runTransaction,
    query,
    Timestamp
} from "firebase/firestore";
import { db } from "@/src/firebase";

/**
 * Get all workshops
 */
export async function getWorkshops() {
    const snap = await getDocs(collection(db, "workshops"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to workshop slots (real-time)
 */
export function subscribeToWorkshopSlots(workshopId, callback) {
    const slotsRef = collection(db, "workshops", workshopId, "slots");

    return onSnapshot(slotsRef, async (snapshot) => {
        const slots = await Promise.all(
            snapshot.docs.map(async (slotDoc) => {
                const slotData = slotDoc.data();

                const bookingsRef = collection(
                    db,
                    "workshops",
                    workshopId,
                    "slots",
                    slotDoc.id,
                    "bookings"
                );

                const bookingsSnap = await getDocs(bookingsRef);

                return {
                    id: slotDoc.id,
                    ...slotData,
                    bookingCount: bookingsSnap.size,
                    remainingSeats:
                        (slotData.maxCapacity || 4) - bookingsSnap.size,
                    isFull:
                        bookingsSnap.size >= (slotData.maxCapacity || 4),
                };
            })
        );

        callback(slots);
    });
}

/**
 * Create booking (transaction-safe)
 */
export async function createBooking(workshopId, slotId, bookingData) {
    try {
        return await runTransaction(db, async (transaction) => {
            const slotRef = doc(db, "workshops", workshopId, "slots", slotId);
            const slotSnap = await transaction.get(slotRef);

            if (!slotSnap.exists()) throw new Error("Slot not found");

            const slotData = slotSnap.data();

            if (slotData.isClosed)
                throw new Error("This slot is closed");

            const bookingsRef = collection(
                db,
                "workshops",
                workshopId,
                "slots",
                slotId,
                "bookings"
            );

            // Count current bookings (use getDocs, not transaction.get)
            const bookingsSnap = await getDocs(bookingsRef);

            if (bookingsSnap.size >= slotData.maxCapacity)
                throw new Error("Slot is full");

            const bookingRef = doc(bookingsRef, bookingData.rollNumber);

            const existing = await transaction.get(bookingRef);
            if (existing.exists())
                throw new Error("Already registered in this slot");

            transaction.set(bookingRef, {
                ...bookingData,
                workshopId,
                slotId,
                slotTime: slotData.time,
                workshopName: slotData.workshopName,
                amount: slotData.price || 0,
                createdAt: Timestamp.now(),
                paymentStatus: "pending"
            });

            return { success: true };
        });
    } catch (error) {
        console.error("BOOKING ERROR:", error);
        return { success: false, error: error.message };
    }
}
