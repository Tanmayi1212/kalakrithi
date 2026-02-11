"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

import {
    createUPILink,
    openUPIApp,
    isUPISupported,
    formatAmount
} from "../utils/upiPayment";

import { createPendingPayment } from "../services/paymentService";

export default function WorkshopPaymentFlow({ workshop }) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        rollNumber: "",
        phone: ""
    });

    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleInput = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    async function handlePayment() {
        setLoading(true);
        setMessage("");

        try {
            const orderId = await createPendingPayment({
                ...formData,
                workshopId: workshop.id,
                slotId: workshop.slotId,
                amount: workshop.price
            });

            const upiLink = createUPILink({
                amount: workshop.price,
                orderId,
                workshopId: workshop.id
            });

            if (isUPISupported()) {
                openUPIApp(upiLink);
            } else {
                const qr = await QRCode.toDataURL(upiLink);
                setQrCode(qr);
            }

            router.push(`/payment-status?orderId=${orderId}`);

        } catch (err) {
            setMessage(err.message);
        }

        setLoading(false);
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
                Register for {workshop.name}
            </h2>

            <input name="name" placeholder="Full Name" onChange={handleInput} className="input" />
            <input name="email" placeholder="Email" onChange={handleInput} className="input" />
            <input name="rollNumber" placeholder="Roll Number" onChange={handleInput} className="input" />
            <input name="phone" placeholder="Phone Number" onChange={handleInput} className="input" />

            <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-3 mt-4 rounded-lg w-full"
            >
                {loading ? "Processing..." : `Pay ${formatAmount(workshop.price)}`}
            </button>

            {qrCode && (
                <div className="mt-6 text-center">
                    <p>Scan to Pay</p>
                    <img src={qrCode} alt="UPI QR" className="mx-auto w-56 h-56" />
                </div>
            )}

            {message && (
                <div className="mt-4 text-red-600">{message}</div>
            )}
        </div>
    );
}
