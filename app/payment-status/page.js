"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
    getPendingPayment,
    submitTransactionId
} from "../../src/services/paymentService";

import {
    isValidTransactionId,
    isPaymentExpired
} from "../../src/utils/upiPayment";

export default function PaymentStatusPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [payment, setPayment] = useState(null);
    const [transactionId, setTransactionId] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!orderId) return;
        getPendingPayment(orderId).then(setPayment);
    }, [orderId]);

    async function handleSubmit() {
        if (!isValidTransactionId(transactionId)) {
            setMessage("Invalid Transaction ID format");
            return;
        }

        if (isPaymentExpired(payment)) {
            setMessage("Payment session expired");
            return;
        }

        try {
            await submitTransactionId(orderId, transactionId);
            setMessage("Transaction submitted. Awaiting verification.");
        } catch (err) {
            setMessage(err.message);
        }
    }

    if (!payment) return <div className="p-6">Loading...</div>;

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Payment Confirmation</h2>

            <p>Workshop: {payment.workshopId}</p>
            <p>Amount: ₹{payment.amount}</p>
            <p>Status: {payment.status}</p>

            {payment.status === "pending" && (
                <>
                    <input
                        type="text"
                        placeholder="Enter UPI Transaction ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="border p-3 w-full mt-4 rounded"
                    />

                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-4 py-3 mt-4 rounded-lg w-full"
                    >
                        Submit Transaction ID
                    </button>
                </>
            )}

            {message && <div className="mt-4 text-red-600">{message}</div>}
        </div>
    );
}
