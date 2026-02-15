import {
    collectionGroup,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    Timestamp,
    getDocs,
    collection,
    increment
} from "firebase/firestore";

import { db } from "@/src/firebase";

/* ------------------------ Helper ------------------------ */

/**
 * Helper to sanitize Firestore data
 * Converts Timestamps to Dates to prevent React rendering errors
 */
const sanitizeData = (data) => {
    if (!data) return data;
    const clean = { ...data };

    Object.keys(clean).forEach((key) => {
        if (
            clean[key] &&
            typeof clean[key] === "object" &&
            typeof clean[key].toDate === "function"
        ) {
            clean[key] = clean[key].toDate().toString();
        }
    });

    return clean;
};

/* ---------------- Subscribe Bookings ---------------- */

export function subscribeToBookingsByStatus(status, callback) {
    const q = query(
        collectionGroup(db, "bookings"),
        where("paymentStatus", "==", status),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const bookings = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...sanitizeData(doc.data())
            }));

            callback(bookings);
        },
        (error) => {
            console.error("Booking Query Error:", error);
            callback([]);
        }
    );
}

/* ---------------- Accept ---------------- */

export async function acceptWorkshopBooking(
    workshopId,
    slotId,
    rollNumber,
    adminUid
) {
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
            paymentStatus: "accepted",
            verifiedBy: adminUid,
            verifiedAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/* ---------------- Reject ---------------- */

export async function rejectWorkshopBooking(
    workshopId,
    slotId,
    rollNumber,
    adminUid
) {
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
            paymentStatus: "rejected",
            verifiedBy: adminUid,
            verifiedAt: Timestamp.now()
        });

        // Decrement slot count
        const slotRef = doc(db, "workshops", workshopId, "slots", slotId);
        await updateDoc(slotRef, {
            currentBookings: increment(-1)
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/* ---------------- Attendance ---------------- */

export async function markAttendance(workshopId, slotId, rollNumber, attended) {
    try {
        const bookingRef = doc(db, "workshops", workshopId, "slots", slotId, "bookings", rollNumber);
        await updateDoc(bookingRef, {
            attended: attended,
            attendanceMarkedAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error("Attendance Error:", error);
        return { success: false, error: error.message };
    }
}

/* ---------------- Workshops & Slots ---------------- */

export async function getWorkshopsWithSlots() {
    try {
        // Fetch all workshops first
        const workshopsSnapshot = await getDocs(collection(db, "workshops"));
        const workshops = workshopsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...sanitizeData(doc.data()),
            slots: []
        }));

        // Now fetch slots for each workshop
        for (const workshop of workshops) {
            const slotsSnapshot = await getDocs(collection(db, "workshops", workshop.id, "slots"));
            workshop.slots = slotsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...sanitizeData(doc.data())
            }));
        }

        return workshops;
    } catch (error) {
        console.error("Get Workshops Error:", error);
        return [];
    }
}

export async function updateSlotCapacity(workshopId, slotId, newCapacity) {
    try {
        const slotRef = doc(db, "workshops", workshopId, "slots", slotId);
        await updateDoc(slotRef, {
            maxCapacity: newCapacity
        });
        return { success: true };
    } catch (error) {
        console.error("Update Capacity Error:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleSlotStatus(workshopId, slotId, isClosed) {
    try {
        const slotRef = doc(db, "workshops", workshopId, "slots", slotId);
        await updateDoc(slotRef, {
            isClosed: isClosed
        });
        return { success: true };
    } catch (error) {
        console.error("Toggle Slot Error:", error);
        return { success: false, error: error.message };
    }
}

/* ---------------- Dashboard Stats ---------------- */

export async function getDashboardStats() {
    try {
        const workshopsSnapshot = await getDocs(collection(db, "workshops"));
        const bookingsSnapshot = await getDocs(collectionGroup(db, "bookings"));

        let totalWorkshops = workshopsSnapshot.size;
        let totalConfirmedBookings = 0;
        let totalPendingPayments = 0;
        let fullSlotsCount = 0;

        bookingsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.paymentStatus === "accepted" || data.paymentStatus === "confirmed") {
                totalConfirmedBookings++;
            } else if (data.paymentStatus === "pending") {
                totalPendingPayments++;
            }
        });

        for (const workshopDoc of workshopsSnapshot.docs) {
            const slotsSnapshot = await getDocs(collection(db, "workshops", workshopDoc.id, "slots"));
            slotsSnapshot.forEach(slotDoc => {
                const slot = slotDoc.data();
                const capacity = slot.maxCapacity || 30;
                if (slot.currentBookings >= capacity) {
                    fullSlotsCount++;
                }
            });
        }

        return {
            totalWorkshops,
            totalConfirmedBookings,
            totalPendingPayments,
            fullSlotsCount
        };
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return {
            totalWorkshops: 0,
            totalConfirmedBookings: 0,
            totalPendingPayments: 0,
            fullSlotsCount: 0
        };
    }
}

export async function getWorkshopBookingCounts() {
    try {
        const bookingsSnapshot = await getDocs(query(collectionGroup(db, "bookings"), where("paymentStatus", "in", ["confirmed", "accepted"])));
        const counts = {};

        bookingsSnapshot.forEach(doc => {
            const data = doc.data();
            const workshopName = data.workshopName || "Unknown";
            counts[workshopName] = (counts[workshopName] || 0) + 1;
        });

        // Convert to array for Recharts
        return Object.entries(counts).map(([name, count]) => ({
            workshopName: name,
            count: count
        }));
    } catch (error) {
        console.error("Booking Counts Error:", error);
        return [];
    }
}
