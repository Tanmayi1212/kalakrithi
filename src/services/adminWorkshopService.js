import {
    collectionGroup,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/src/firebase";

/**
 * Subscribe to bookings by status
 */
export function subscribeToBookingsByStatus(status, callback) {
    const q = query(
        collectionGroup(db, "bookings"),
        where("paymentStatus", "==", status),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            callback(bookings);
        },
        (error) => {
            console.error("ADMIN QUERY ERROR:", error);
            callback([]);
        }
    );
}

/**
 * Confirm booking
 */
export async function confirmWorkshopBooking(
    workshopId,
    slotId,
    rollNumber,
    adminUid,
    bookingDetails // Passing full booking details for email
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
            paymentStatus: "confirmed",
            confirmedBy: adminUid,
            confirmedAt: Timestamp.now(),
        });

        // Trigger Email
        if (bookingDetails) {
            await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: bookingDetails.name,
                    email: bookingDetails.email,
                    workshopName: bookingDetails.workshopName,
                    slotTime: bookingDetails.slotTime,
                    paymentStatus: "confirmed",
                }),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Confirmation Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Reject booking
 */
export async function rejectWorkshopBooking(
    workshopId,
    slotId,
    rollNumber,
    adminUid,
    bookingDetails
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
            rejectedBy: adminUid,
            rejectedAt: Timestamp.now(),
        });

        // Trigger Email
        if (bookingDetails) {
            await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: bookingDetails.name,
                    email: bookingDetails.email,
                    workshopName: bookingDetails.workshopName,
                    slotTime: bookingDetails.slotTime,
                    paymentStatus: "rejected",
                }),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Rejection Error:", error);
        return { success: false, error: error.message };
    }
}
