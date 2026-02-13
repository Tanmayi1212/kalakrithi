/**
 * Admin Service for Workshop Bookings
 * Manages workshop bookings with the new 15-minute slot structure
 */

import {
    collection,
    collectionGroup,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    updateDoc,
    onSnapshot,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/src/firebase";

/**
 * Subscribe to all workshop bookings in real-time
 * @param {function} callback - Called with updated bookings array
 * @returns {function} Unsubscribe function
 */
export function subscribeToAllWorkshopBookings(callback) {
    // Query all bookings across all workshops and slots using collection group
    const bookingsQuery = query(
        collectionGroup(db, "bookings"),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(bookingsQuery, (snapshot) => {
        const bookings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        callback(bookings);
    });
}

/**
 * Subscribe to bookings filtered by payment status
 * @param {string} status - "pending" or "confirmed"
 * @param {function} callback 
 * @returns {function} Unsubscribe function
 */
export function subscribeToBookingsByStatus(status, callback) {
    const bookingsQuery = query(
        collectionGroup(db, "bookings"),
        where("paymentStatus", "==", status),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(bookingsQuery, (snapshot) => {
        const bookings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        callback(bookings);
    });
}

/**
 * Get workshop statistics
 * @returns {Promise<object>}
 */
export async function getWorkshopStats() {
    try {
        // Get all bookings
        const allBookingsSnap = await getDocs(collectionGroup(db, "bookings"));
        const totalBookings = allBookingsSnap.size;

        // Count by status
        let pending = 0;
        let confirmed = 0;
        let totalRevenue = 0;

        allBookingsSnap.forEach((doc) => {
            const data = doc.data();
            if (data.paymentStatus === "pending") {
                pending++;
            } else if (data.paymentStatus === "confirmed") {
                confirmed++;
                // Add revenue if available
                if (data.amount) {
                    totalRevenue += data.amount;
                }
            }
        });

        return {
            totalBookings,
            pendingBookings: pending,
            confirmedBookings: confirmed,
            totalRevenue,
        };
    } catch (error) {
        console.error("Error fetching workshop stats:", error);
        throw error;
    }
}

/**
 * Confirm a booking (admin action)
 * @param {string} workshopId 
 * @param {string} slotId 
 * @param {string} rollNumber 
 * @param {string} adminUid 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function confirmWorkshopBooking(workshopId, slotId, rollNumber, adminUid) {
    try {
        const bookingRef = doc(
            db,
            "workshops",
            workshopId,
            "slots",
            slotId,
            "bookings",
            rollNumber
        );

        await updateDoc(bookingRef, {
            paymentStatus: "confirmed",
            confirmedBy: adminUid,
            confirmedAt: Timestamp.now(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error confirming booking:", error);
        return {
            success: false,
            error: error.message || "Failed to confirm booking",
        };
    }
}

/**
 * Reject/delete a booking (admin action)
 * @param {string} workshopId 
 * @param {string} slotId 
 * @param {string} rollNumber 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function rejectWorkshopBooking(workshopId, slotId, rollNumber) {
    try {
        const bookingRef = doc(
            db,
            "workshops",
            workshopId,
            "slots",
            slotId,
            "bookings",
            rollNumber
        );

        await deleteDoc(bookingRef);

        return { success: true };
    } catch (error) {
        console.error("Error rejecting booking:", error);
        return {
            success: false,
            error: error.message || "Failed to reject booking",
        };
    }
}

/**
 * Get all workshops with slot statistics
 * @returns {Promise<Array>}
 */
export async function getWorkshopsWithStats() {
    try {
        const workshopsSnap = await getDocs(collection(db, "workshops"));

        const workshopsWithStats = await Promise.all(
            workshopsSnap.docs.map(async (workshopDoc) => {
                const workshopData = workshopDoc.data();

                // Get all slots for this workshop
                const slotsSnap = await getDocs(
                    collection(db, "workshops", workshopDoc.id, "slots")
                );

                let totalCapacity = 0;
                let totalBookings = 0;

                for (const slotDoc of slotsSnap.docs) {
                    const slotData = slotDoc.data();
                    totalCapacity += slotData.maxCapacity || 0;

                    // Count bookings for this slot
                    const bookingsSnap = await getDocs(
                        collection(db, "workshops", workshopDoc.id, "slots", slotDoc.id, "bookings")
                    );
                    totalBookings += bookingsSnap.size;
                }

                return {
                    id: workshopDoc.id,
                    ...workshopData,
                    totalSlots: slotsSnap.size,
                    totalCapacity,
                    totalBookings,
                    availableSeats: totalCapacity - totalBookings,
                };
            })
        );

        return workshopsWithStats;
    } catch (error) {
        console.error("Error fetching workshops with stats:", error);
        throw error;
    }
}
