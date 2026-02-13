"use client";

import { useState, useEffect } from "react";
import { subscribeToBookingsByStatus, confirmWorkshopBooking } from "@/src/services/adminWorkshopService";
import { getCurrentAdmin } from "@/src/utils/adminAuth";
import { CheckCircle, Clock, User, Mail, Phone, Calendar } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import toast from "react-hot-toast";

export default function WorkshopBookingsView() {
    const [pendingBookings, setPendingBookings] = useState([]);
    const [confirmedBookings, setConfirmedBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("pending"); // "pending" | "confirmed"
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        loadAdmin();
    }, []);

    useEffect(() => {
        // Subscribe to pending bookings
        const unsubscribePending = subscribeToBookingsByStatus("pending", (bookings) => {
            setPendingBookings(bookings);
            setLoading(false);
        });

        // Subscribe to confirmed bookings
        const unsubscribeConfirmed = subscribeToBookingsByStatus("confirmed", (bookings) => {
            setConfirmedBookings(bookings);
        });

        return () => {
            unsubscribePending();
            unsubscribeConfirmed();
        };
    }, []);

    async function loadAdmin() {
        const { user } = await getCurrentAdmin();
        setAdminUser(user);
    }

    async function handleConfirm(booking) {
        if (!adminUser) {
            toast.error("Admin user not loaded");
            return;
        }

        setProcessingId(booking.id);

        const result = await confirmWorkshopBooking(
            booking.workshopId,
            booking.slotId,
            booking.rollNumber,
            adminUser.uid
        );

        if (result.success) {
            toast.success(`Confirmed ${booking.name}'s booking`);
        } else {
            toast.error(result.error || "Failed to confirm");
        }

        setProcessingId(null);
    }

    const displayBookings = activeTab === "pending" ? pendingBookings : confirmedBookings;

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <h1 className="text-2xl font-bold text-gray-900">Workshop Bookings</h1>
                <Card className="animate-pulse">
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded" />
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Workshop Bookings</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage workshop registrations</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant={activeTab === "pending" ? "warning" : "default"}>
                        {pendingBookings.length} Pending
                    </Badge>
                    <Badge variant={activeTab === "confirmed" ? "success" : "default"}>
                        {confirmedBookings.length} Confirmed
                    </Badge>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === "pending"
                            ? "border-yellow-500 text-yellow-700"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Pending ({pendingBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab("confirmed")}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === "confirmed"
                            ? "border-green-500 text-green-700"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Confirmed ({confirmedBookings.length})
                </button>
            </div>

            {/* Bookings List */}
            {displayBookings.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No {activeTab} bookings
                        </h2>
                        <p className="text-gray-600">
                            {activeTab === "pending"
                                ? "New workshop registrations will appear here"
                                : "Confirmed bookings will appear here"}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayBookings.map((booking) => (
                        <Card key={booking.id} className="p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{booking.name}</h3>
                                    <p className="text-sm text-gray-600">{booking.workshopName}</p>
                                </div>
                                <Badge variant={activeTab === "pending" ? "warning" : "success"}>
                                    {activeTab === "pending" ? "Pending" : "Confirmed"}
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Roll:</span>
                                    <span>{booking.rollNumber}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Email:</span>
                                    <span className="truncate">{booking.email}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Phone:</span>
                                    <span>{booking.phone}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Slot:</span>
                                    <span>{booking.slotTime}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Registered:</span>
                                    <span>
                                        {booking.createdAt?.toLocaleDateString("en-IN", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>

                            {activeTab === "pending" && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <Button
                                        onClick={() => handleConfirm(booking)}
                                        disabled={processingId === booking.id}
                                        variant="success"
                                        size="sm"
                                        icon={CheckCircle}
                                        className="w-full"
                                    >
                                        {processingId === booking.id ? "Confirming..." : "Confirm Payment"}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
