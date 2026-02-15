"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase";
import {
    subscribeToBookingsByStatus,
    acceptWorkshopBooking,
    rejectWorkshopBooking
} from "@/src/services/adminWorkshopService";

export default function PendingPaymentsTable() {
    const [bookings, setBookings] = useState([]);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, setAdminUser);
        const unsubBookings = subscribeToBookingsByStatus(
            "pending",
            setBookings
        );

        return () => {
            unsubAuth();
            unsubBookings();
        };
    }, []);

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleString("en-IN");
    };

    const handleAccept = async (b) => {
        if (!adminUser) return;
        await acceptWorkshopBooking(
            b.workshopId,
            b.slotId,
            b.rollNumber,
            adminUser.uid
        );
    };

    const handleReject = async (b) => {
        if (!adminUser) return;
        await rejectWorkshopBooking(
            b.workshopId,
            b.slotId,
            b.rollNumber,
            adminUser.uid
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Pending Payments</h1>

            {bookings.map((b) => (
                <div
                    key={`${b.workshopId}-${b.slotId}-${b.rollNumber}`}
                    className="border p-4 flex justify-between items-center"
                >
                    <div>
                        <p>{b.name}</p>
                        <p className="text-sm text-gray-500">
                            {b.workshopName} · {b.slotTime}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                            {formatDate(b.createdAt)}
                        </p>

                        {b.paymentScreenshot && (
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-gray-600 mb-1">Payment Screenshot:</p>
                                <a href={b.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="inline-block">
                                    <img
                                        src={b.paymentScreenshot}
                                        alt="Payment"
                                        className="h-64 w-auto max-w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                                    />
                                </a>
                            </div>
                        )}

                        <p className="text-sm">
                            <span className="font-semibold text-gray-600">UTR:</span>
                            <span className="font-mono ml-1 bg-gray-100 px-2 py-0.5 rounded text-gray-800 select-all">
                                {b.transactionId || "N/A"}
                            </span>
                        </p>
                    </div>

                    <div className="space-x-2">
                        <button
                            onClick={() => handleAccept(b)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleReject(b)}
                            className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
