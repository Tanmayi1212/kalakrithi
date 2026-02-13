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
    adminUid
) {
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
}
