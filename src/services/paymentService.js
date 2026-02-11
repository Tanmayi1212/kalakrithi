import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { generateOrderId } from "../utils/upiPayment";

/* -------------------------------------------------- */
/* CREATE PENDING PAYMENT */
/* -------------------------------------------------- */

export async function createPendingPayment(data) {
    const {
        workshopId,
        slotId,
        name,
        email,
        phone,
        rollNumber,
        amount
    } = data;

    if (!workshopId || !slotId || !name || !email || !phone || !rollNumber || !amount) {
        throw new Error("Missing required fields");
    }

    if (amount <= 0) {
        throw new Error("Invalid payment amount");
    }

    const paymentsRef = collection(db, "pendingPayments");

    // prevent duplicate active payments
    const existingQuery = query(
        paymentsRef,
        where("rollNumber", "==", rollNumber),
        where("status", "in", ["pending", "submitted"])
    );

    const existing = await getDocs(existingQuery);

    if (!existing.empty) {
        throw new Error("You already have a pending payment");
    }

    const orderId = generateOrderId();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    await setDoc(doc(db, "pendingPayments", orderId), {
        orderId,
        workshopId,
        slotId,
        name,
        email,
        phone,
        rollNumber,
        amount,
        status: "pending",
        paymentProvider: "upi",
        providerOrderId: null,
        providerPaymentId: null,
        createdAt: serverTimestamp(),
        expiresAt,
        updatedAt: serverTimestamp()
    });

    return orderId;
}

/* -------------------------------------------------- */
/* FETCH PAYMENT */
/* -------------------------------------------------- */

export async function getPendingPayment(orderId) {
    const snap = await getDoc(doc(db, "pendingPayments", orderId));
    if (!snap.exists()) return null;
    return snap.data();
}

/* -------------------------------------------------- */
/* SUBMIT TRANSACTION ID */
/* -------------------------------------------------- */

export async function submitTransactionId(orderId, transactionId) {
    const ref = doc(db, "pendingPayments", orderId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error("Payment not found");

    const payment = snap.data();

    if (payment.status !== "pending") {
        throw new Error("Payment already processed");
    }

    await updateDoc(ref, {
        status: "submitted",
        transactionId,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return true;
}
