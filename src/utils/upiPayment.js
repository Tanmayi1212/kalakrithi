/**
 * UPI Payment Utilities
 * Kalakrithi × Arangetra
 */

function getEnv(key, fallback = null) {
    if (typeof process === "undefined") return fallback;
    return process.env[key] || fallback;
}

/* -------------------------------------------------- */
/* ORDER ID GENERATION */
/* -------------------------------------------------- */

export function generateOrderId() {
    return "ord_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
}

/* -------------------------------------------------- */
/* CREATE UPI LINK */
/* -------------------------------------------------- */

export function createUPILink({
    amount,
    orderId,
    workshopId,
    upiId = getEnv("NEXT_PUBLIC_UPI_ID"),
    payeeName = getEnv("NEXT_PUBLIC_UPI_PAYEE_NAME", "Kalakrithi"),
}) {
    if (!amount || Number(amount) <= 0) {
        throw new Error("Invalid payment amount");
    }

    if (!orderId || !workshopId) {
        throw new Error("Order ID and Workshop ID required");
    }

    if (!upiId) {
        throw new Error("UPI ID missing. Configure NEXT_PUBLIC_UPI_ID");
    }

    const params = new URLSearchParams();
    params.append("pa", upiId);
    params.append("pn", payeeName);
    params.append("am", Number(amount).toFixed(0));
    params.append("cu", "INR");
    params.append("tn", `WKSP-${workshopId}-${orderId}`);

    return `upi://pay?${params.toString()}`;
}

/* -------------------------------------------------- */
/* DEVICE DETECTION */
/* -------------------------------------------------- */

export function isUPISupported() {
    if (typeof window === "undefined") return false;

    const ua = navigator.userAgent.toLowerCase();
    return /android|iphone|ipad/.test(ua);
}

/* -------------------------------------------------- */
/* OPEN UPI APP */
/* -------------------------------------------------- */

export function openUPIApp(link) {
    if (typeof window === "undefined") return false;
    try {
        window.location.href = link;
        return true;
    } catch {
        return false;
    }
}

/* -------------------------------------------------- */
/* FORMAT AMOUNT */
/* -------------------------------------------------- */

export function formatAmount(amount) {
    const num = Number(amount);
    if (isNaN(num)) return "₹0";
    return `₹${num.toFixed(0)}`;
}

/* -------------------------------------------------- */
/* VALIDATE TRANSACTION ID */
/* -------------------------------------------------- */

export function isValidTransactionId(id) {
    if (!id) return false;
    const clean = id.trim();
    return /^[a-zA-Z0-9]{8,20}$/.test(clean);
}

/* -------------------------------------------------- */
/* EXPIRY CHECK */
/* -------------------------------------------------- */

export function isPaymentExpired(payment) {
    if (!payment?.expiresAt) return true;

    const expiry =
        payment.expiresAt.toDate?.().getTime() ||
        new Date(payment.expiresAt).getTime();

    return Date.now() > expiry;
}
