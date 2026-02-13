"use client";

import { useState, useEffect } from "react";
import {
    subscribeToBookingsByStatus,
    confirmWorkshopBooking
} from "@/src/services/adminWorkshopService";
import { getCurrentAdmin } from "@/src/utils/adminAuth";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export default function PendingPaymentsTable() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        loadAdminUser();
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToBookingsByStatus(
            "pending",
            (data) => {
                setBookings(data);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    async function loadAdminUser() {
        const { user } = await getCurrentAdmin();
        setAdminUser(user);
    }

    async function handleConfirm(booking) {
        if (!adminUser) return;

        setProcessingId(booking.id);

        const result = await confirmWorkshopBooking(
            booking.workshopId,
            booking.slotId,
            booking.rollNumber,
            adminUser.uid
        );

        setProcessingId(null);
    }

    if (loading) {
        return (
            <div className="p-6">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Pending Bookings</h1>
                <Badge variant="warning">
                    <Clock className="w-4 h-4 mr-1" />
                    {bookings.length}
                </Badge>
            </div>

            {bookings.length === 0 ? (
                <Card className="p-6 text-center">
                    No pending payments 🎉
                </Card>
            ) : (
                <Card className="p-6">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="flex justify-between items-center border-b py-3"
                        >
                            <div>
                                <p className="font-medium">{booking.name}</p>
                                <p className="text-sm text-gray-500">
                                    {booking.workshopName} · {booking.slotTime}
                                </p>
                            </div>

                            <Button
                                onClick={() => handleConfirm(booking)}
                                disabled={processingId === booking.id}
                                variant="success"
                                size="sm"
                            >
                                {processingId === booking.id
                                    ? "Processing..."
                                    : "Confirm"}
                            </Button>
                        </div>
                    ))}
                </Card>
            )}
        </div>
    );
}
