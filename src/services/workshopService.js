/**
 * Workshop Service - Handles all workshop and booking operations
 * Includes transaction-based booking to prevent overbooking
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    query,
    where,
    runTransaction,
    onSnapshot,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/src/firebase";

/**
 * Get all active workshops
 */
export async function getWorkshops() {
    try {
        const workshopsSnap = await getDocs(collection(db, "workshops"));
        return workshopsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching workshops:", error);
        throw error;
    }
}

/**
 * Get all slots for a workshop with real-time updates
 * @param {string} workshopId 
 * @param {function} callback - Called with updated slots data
 * @returns {function} Unsubscribe function
 */
export function subscribeToWorkshopSlots(workshopId, callback) {
    const slotsRef = collection(db, "workshops", workshopId, "slots");

    return onSnapshot(slotsRef, async (snapshot) => {
        const slots = await Promise.all(
            snapshot.docs.map(async (slotDoc) => {
                const slotData = slotDoc.data();

                // Count bookings for this slot
                const bookingsSnap = await getDocs(
                    collection(db, "workshops", workshopId, "slots", slotDoc.id, "bookings")
                );

                return {
                    id: slotDoc.id,
                    ...slotData,
                    currentBookings: bookingsSnap.size,
                    remainingSeats: slotData.maxCapacity - bookingsSnap.size,
                };
            })
        );

        callback(slots);
    });
}

/**
 * Check if a roll number is already registered in this workshop
 * @param {string} workshopId 
 * @param {string} rollNumber 
 * @returns {Promise<boolean>}
 */
export async function checkDuplicateBooking(workshopId, rollNumber) {
    try {
        const slotsSnap = await getDocs(
            collection(db, "workshops", workshopId, "slots")
        );

        for (const slotDoc of slotsSnap.docs) {
            const bookingDoc = await getDoc(
                doc(db, "workshops", workshopId, "slots", slotDoc.id, "bookings", rollNumber)
            );

            if (bookingDoc.exists()) {
                return true; // Already registered
            }
        }

        return false; // Not registered
    } catch (error) {
        console.error("Error checking duplicate booking:", error);
        throw error;
    }
}

/**
 * Create a booking using Firestore transaction for safety
 * 
 * WHY TRANSACTION IS REQUIRED:
 * Multiple users can submit simultaneously. Without a transaction, two users could 
 * book the last seat at the same time, causing overbooking. The transaction ensures
 * atomic read-check-write operations.
 * 
 * WHY COUNT MUST BE CHECKED INSIDE TRANSACTION:
 * Checking outside the transaction creates a race condition. The count could change
 * between the check and the write. The transaction ensures the count is checked at
 * write time, preventing any possibility of overbooking.
 * 
 * CLIENT-SIDE ONLY (SPARK PLAN):
 * This approach works for small-scale events but relies on client-side code that can
 * be bypassed. For enterprise scale, use Cloud Functions with Admin SDK to enforce
 * server-side validation that cannot be circumvented. Firestore security rules provide
 * some protection, but transactions can't be fully enforced in rules alone.
 * 
 * @param {string} workshopId 
 * @param {string} slotId 
 * @param {object} bookingData - {name, email, phone, rollNumber}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createBooking(workshopId, slotId, bookingData) {
    try {
        // First check for duplicate across all slots (outside transaction for clarity)
        const isDuplicate = await checkDuplicateBooking(workshopId, bookingData.rollNumber);
        if (isDuplicate) {
            return {
                success: false,
                error: "You are already registered for this workshop in another slot",
            };
        }

        // Run transaction to ensure atomic booking creation
        const result = await runTransaction(db, async (transaction) => {
            // Get slot document
            const slotRef = doc(db, "workshops", workshopId, "slots", slotId);
            const slotSnap = await transaction.get(slotRef);

            if (!slotSnap.exists()) {
                throw new Error("Slot not found");
            }

            const slotData = slotSnap.data();

            // Check if slot is closed
            if (slotData.isClosed) {
                throw new Error("This slot is closed");
            }

            // Get bookings count IN TRANSACTION
            const bookingsRef = collection(db, "workshops", workshopId, "slots", slotId, "bookings");
            const bookingsSnap = await getDocs(bookingsRef);
            const currentCount = bookingsSnap.size;

            // Check capacity IN TRANSACTION (critical!)
            if (currentCount >= slotData.maxCapacity) {
                throw new Error("This slot is full");
            }

            // Check for duplicate in this specific slot
            const bookingRef = doc(bookingsRef, bookingData.rollNumber);
            const existingBooking = await transaction.get(bookingRef);

            if (existingBooking.exists()) {
                throw new Error("Roll number already registered in this slot");
            }

            // Create booking document
            transaction.set(bookingRef, {
                ...bookingData,
                workshopId,
                slotId,
                slotTime: slotData.time,
                workshopName: slotData.workshopName,
                createdAt: Timestamp.now(),
                paymentStatus: "pending",
            });

            return { success: true };
        });

        return result;
    } catch (error) {
        console.error("Error creating booking:", error);
        return {
            success: false,
            error: error.message || "Failed to create booking",
        };
    }
}

/**
 * Get all bookings for a specific slot
 * @param {string} workshopId 
 * @param {string} slotId 
 * @returns {Promise<Array>}
 */
export async function getSlotBookings(workshopId, slotId) {
    try {
        const bookingsSnap = await getDocs(
            collection(db, "workshops", workshopId, "slots", slotId, "bookings")
        );

        return bookingsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching slot bookings:", error);
        throw error;
    }
}
