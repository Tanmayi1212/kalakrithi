/**
 * Admin Service Layer
 * Centralized Firestore operations for admin dashboard
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    setDoc,
    query,
    where,
    orderBy,
    runTransaction,
    onSnapshot,
    Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

// ============================================
// PENDING PAYMENTS
// ============================================

/**
 * Get all pending payments with real-time updates
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToPendingPayments(callback) {
    const q = query(
        collection(db, "pendingPayments"),
        where("status", "==", "submitted"),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const payments = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            }));
            callback(payments);
        },
        (error) => {
            console.error("Error fetching pending payments:", error);
            toast.error("Failed to load pending payments");
            callback([]);
        }
    );
}

/**
 * Confirm a payment and create booking
 * @param {string} paymentId - Payment document ID
 * @param {string} adminUid - Admin user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function confirmPayment(paymentId, adminUid) {
    try {
        const result = await runTransaction(db, async (transaction) => {
            // 1. Get payment document
            const paymentRef = doc(db, "pendingPayments", paymentId);
            const paymentDoc = await transaction.get(paymentRef);

            if (!paymentDoc.exists()) {
                throw new Error("Payment not found");
            }

            const paymentData = paymentDoc.data();

            if (paymentData.status !== "submitted") {
                throw new Error("Payment already processed");
            }

            // 2. Get slot document
            const slotRef = doc(
                db,
                "workshops",
                paymentData.workshopId,
                "slots",
                paymentData.slotId
            );
            const slotDoc = await transaction.get(slotRef);

            if (!slotDoc.exists()) {
                throw new Error("Slot not found");
            }

            const slotData = slotDoc.data();

            // 3. Count current bookings
            const bookingsRef = collection(
                db,
                "workshops",
                paymentData.workshopId,
                "slots",
                paymentData.slotId,
                "bookings"
            );
            const bookingsSnapshot = await getDocs(bookingsRef);
            const currentBookings = bookingsSnapshot.size;

            // 4. Check capacity
            const maxCapacity = slotData.maxCapacity || 30;
            if (currentBookings >= maxCapacity) {
                throw new Error("Slot is full. No seats available.");
            }

            // 5. Check if booking already exists
            const bookingRef = doc(bookingsRef, paymentData.rollNumber);
            const existingBooking = await transaction.get(bookingRef);

            if (existingBooking.exists()) {
                throw new Error("Booking already exists for this roll number");
            }

            // 6. Update payment status
            transaction.update(paymentRef, {
                status: "confirmed",
                confirmedAt: Timestamp.now(),
                confirmedBy: adminUid,
            });

            // 7. Create booking
            transaction.set(bookingRef, {
                name: paymentData.name,
                email: paymentData.email,
                rollNumber: paymentData.rollNumber,
                phone: paymentData.phone,
                workshopId: paymentData.workshopId,
                workshopName: paymentData.workshopName,
                slotId: paymentData.slotId,
                slotTime: paymentData.slotTime,
                amount: paymentData.amount,
                transactionId: paymentData.transactionId,
                paymentId: paymentId,
                createdAt: Timestamp.now(),
                confirmedBy: adminUid,
                confirmedAt: Timestamp.now(),
                attendanceMarked: false,
            });

            return { success: true };
        });

        toast.success("Payment confirmed successfully!");
        return result;
    } catch (error) {
        console.error("Error confirming payment:", error);
        const errorMessage = error.message || "Failed to confirm payment";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
    }
}

/**
 * Reject a payment
 * @param {string} paymentId - Payment document ID
 * @param {string} adminUid - Admin user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function rejectPayment(paymentId, adminUid) {
    try {
        const paymentRef = doc(db, "pendingPayments", paymentId);

        await updateDoc(paymentRef, {
            status: "rejected",
            rejectedAt: Timestamp.now(),
            rejectedBy: adminUid,
        });

        toast.success("Payment rejected");
        return { success: true };
    } catch (error) {
        console.error("Error rejecting payment:", error);
        const errorMessage = "Failed to reject payment";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
    }
}

// ============================================
// CONFIRMED BOOKINGS
// ============================================

/**
 * Get all confirmed bookings
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToConfirmedBookings(callback) {
    const q = query(
        collection(db, "pendingPayments"),
        where("status", "==", "confirmed"),
        orderBy("confirmedAt", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const bookings = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                confirmedAt: doc.data().confirmedAt?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
            }));
            callback(bookings);
        },
        (error) => {
            console.error("Error fetching confirmed bookings:", error);
            toast.error("Failed to load confirmed bookings");
            callback([]);
        }
    );
}

/**
 * Mark attendance for a booking
 * @param {string} workshopId - Workshop ID
 * @param {string} slotId - Slot ID
 * @param {string} rollNumber - Student roll number
 * @param {string} status - "present" or "absent"
 * @param {string} adminUid - Admin user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function markAttendance(workshopId, slotId, rollNumber, status, adminUid) {
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
            attendanceMarked: true,
            attendanceStatus: status,
            attendanceMarkedAt: Timestamp.now(),
            attendanceMarkedBy: adminUid,
        });

        toast.success(`Marked as ${status}`);
        return { success: true };
    } catch (error) {
        console.error("Error marking attendance:", error);
        const errorMessage = "Failed to mark attendance";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
    }
}

// ============================================
// SLOT MANAGEMENT
// ============================================

/**
 * Get all workshops with their slots
 * @returns {Promise<Array>} Array of workshops with slots
 */
export async function getWorkshopsWithSlots() {
    try {
        const workshopsSnapshot = await getDocs(collection(db, "workshops"));
        const workshops = [];

        for (const workshopDoc of workshopsSnapshot.docs) {
            const workshopData = workshopDoc.data();

            // Get slots for this workshop
            const slotsSnapshot = await getDocs(
                collection(db, "workshops", workshopDoc.id, "slots")
            );

            const slots = await Promise.all(
                slotsSnapshot.docs.map(async (slotDoc) => {
                    const slotData = slotDoc.data();

                    // Count bookings for this slot
                    const bookingsSnapshot = await getDocs(
                        collection(
                            db,
                            "workshops",
                            workshopDoc.id,
                            "slots",
                            slotDoc.id,
                            "bookings"
                        )
                    );

                    return {
                        id: slotDoc.id,
                        ...slotData,
                        currentBookings: bookingsSnapshot.size,
                        remainingSeats: (slotData.maxCapacity || 30) - bookingsSnapshot.size,
                        isFull: bookingsSnapshot.size >= (slotData.maxCapacity || 30),
                    };
                })
            );

            workshops.push({
                id: workshopDoc.id,
                ...workshopData,
                slots,
            });
        }

        return workshops;
    } catch (error) {
        console.error("Error fetching workshops with slots:", error);
        toast.error("Failed to load workshops");
        return [];
    }
}

/**
 * Update slot capacity
 * @param {string} workshopId - Workshop ID
 * @param {string} slotId - Slot ID
 * @param {number} newCapacity - New max capacity
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateSlotCapacity(workshopId, slotId, newCapacity) {
    try {
        // Get current bookings count
        const bookingsSnapshot = await getDocs(
            collection(db, "workshops", workshopId, "slots", slotId, "bookings")
        );
        const currentBookings = bookingsSnapshot.size;

        if (newCapacity < currentBookings) {
            throw new Error(
                `Cannot set capacity below current bookings (${currentBookings})`
            );
        }

        const slotRef = doc(db, "workshops", workshopId, "slots", slotId);
        await updateDoc(slotRef, {
            maxCapacity: newCapacity,
        });

        toast.success("Slot capacity updated");
        return { success: true };
    } catch (error) {
        console.error("Error updating slot capacity:", error);
        const errorMessage = error.message || "Failed to update capacity";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
    }
}

/**
 * Toggle slot open/closed status
 * @param {string} workshopId - Workshop ID
 * @param {string} slotId - Slot ID
 * @param {boolean} isClosed - Whether slot should be closed
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function toggleSlotStatus(workshopId, slotId, isClosed) {
    try {
        const slotRef = doc(db, "workshops", workshopId, "slots", slotId);
        await updateDoc(slotRef, {
            isClosed,
        });

        toast.success(isClosed ? "Slot closed" : "Slot opened");
        return { success: true };
    } catch (error) {
        console.error("Error toggling slot status:", error);
        const errorMessage = "Failed to update slot status";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
    }
}

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
export async function getDashboardStats() {
    try {
        // Total workshops
        const workshopsSnapshot = await getDocs(collection(db, "workshops"));
        const totalWorkshops = workshopsSnapshot.size;

        // Total confirmed bookings
        const confirmedQuery = query(
            collection(db, "pendingPayments"),
            where("status", "==", "confirmed")
        );
        const confirmedSnapshot = await getDocs(confirmedQuery);
        const totalConfirmedBookings = confirmedSnapshot.size;

        // Total pending payments
        const pendingQuery = query(
            collection(db, "pendingPayments"),
            where("status", "==", "submitted")
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const totalPendingPayments = pendingSnapshot.size;

        // Count full slots
        let fullSlotsCount = 0;
        for (const workshopDoc of workshopsSnapshot.docs) {
            const slotsSnapshot = await getDocs(
                collection(db, "workshops", workshopDoc.id, "slots")
            );

            for (const slotDoc of slotsSnapshot.docs) {
                const slotData = slotDoc.data();
                const bookingsSnapshot = await getDocs(
                    collection(
                        db,
                        "workshops",
                        workshopDoc.id,
                        "slots",
                        slotDoc.id,
                        "bookings"
                    )
                );

                if (bookingsSnapshot.size >= (slotData.maxCapacity || 30)) {
                    fullSlotsCount++;
                }
            }
        }

        return {
            totalWorkshops,
            totalConfirmedBookings,
            totalPendingPayments,
            fullSlotsCount,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load statistics");
        return {
            totalWorkshops: 0,
            totalConfirmedBookings: 0,
            totalPendingPayments: 0,
            fullSlotsCount: 0,
        };
    }
}

/**
 * Get workshop booking counts for chart
 * @returns {Promise<Array>} Array of {workshopName, count}
 */
export async function getWorkshopBookingCounts() {
    try {
        const confirmedQuery = query(
            collection(db, "pendingPayments"),
            where("status", "==", "confirmed")
        );
        const confirmedSnapshot = await getDocs(confirmedQuery);

        // Group by workshop
        const workshopCounts = {};
        confirmedSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const workshopName = data.workshopName || "Unknown";
            workshopCounts[workshopName] = (workshopCounts[workshopName] || 0) + 1;
        });

        // Convert to array for chart
        return Object.entries(workshopCounts).map(([name, count]) => ({
            workshopName: name,
            count,
        }));
    } catch (error) {
        console.error("Error fetching workshop booking counts:", error);
        return [];
    }
}
