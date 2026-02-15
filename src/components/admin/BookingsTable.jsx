"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase";
import {
    subscribeToBookingsByStatus,
    acceptWorkshopBooking,
    rejectWorkshopBooking
} from "@/src/services/adminWorkshopService";

export default function BookingsTable({ status = "accepted" }) {
    const [bookings, setBookings] = useState([]);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setAdminUser(user);
        });

        const unsubscribeBookings = subscribeToBookingsByStatus(
            status,
            setBookings
        );

        return () => {
            unsubscribeAuth();
            unsubscribeBookings();
        };
    }, [status]);

    const formatDate = (date) => {
        try {
            if (!date) return "-";
            // If it's a Firestore Timestamp that wasn't sanitized for some reason
            if (date.seconds) return new Date(date.seconds * 1000).toLocaleString("en-IN");
            // If it's already a Date object or string
            const d = new Date(date);
            return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleString("en-IN");
        } catch (e) {
            console.error("Date formatting error:", e);
            return "Error";
        }
    };

    console.log("Rendering BookingsTable with:", bookings.length, "bookings");
    if (bookings.length > 0) {
        console.log("Sample booking:", JSON.stringify(bookings[0], null, 2));
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold capitalize">
                {status} Bookings
            </h1>

            {bookings.length === 0 ? (
                <div>No bookings found</div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Roll</th>
                                <th className="p-4">Workshop</th>
                                <th className="p-4">Slot</th>
                                <th className="p-4">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => (
                                <tr key={`${b.workshopId}-${b.slotId}-${b.rollNumber}`}>
                                    <td className="p-4">
                                        {typeof b.name === 'object' ? JSON.stringify(b.name) : b.name}
                                    </td>
                                    <td className="p-4">
                                        {typeof b.rollNumber === 'object' ? JSON.stringify(b.rollNumber) : b.rollNumber}
                                    </td>
                                    <td className="p-4">
                                        {typeof b.workshopName === 'object' ? JSON.stringify(b.workshopName) : b.workshopName}
                                    </td>
                                    <td className="p-4">
                                        {typeof b.slotTime === 'object' ? JSON.stringify(b.slotTime) : b.slotTime}
                                    </td>
                                    <td className="p-4">
                                        {formatDate(b.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
