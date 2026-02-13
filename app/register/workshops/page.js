"use client";

import { useState, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/src/firebase";
import {
    getWorkshops,
    subscribeToWorkshopSlots,
    createBooking,
} from "@/src/services/workshopService";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, Clock, Users, AlertCircle } from "lucide-react";

export default function WorkshopRegistration() {
    const [workshops, setWorkshops] = useState([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        rollNumber: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (selectedWorkshop) {
            // Subscribe to real-time slot updates
            const unsubscribe = subscribeToWorkshopSlots(selectedWorkshop.id, (updatedSlots) => {
                setSlots(updatedSlots);
            });

            return () => unsubscribe();
        }
    }, [selectedWorkshop]);

    async function init() {
        try {
            // Ensure auth
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }

            // Load workshops
            const workshopsData = await getWorkshops();
            setWorkshops(workshopsData.filter((w) => w.isActive));
            setLoading(false);
        } catch (error) {
            console.error("Error initializing:", error);
            toast.error("Failed to load workshops");
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!selectedWorkshop || !selectedSlot) {
            toast.error("Please select a workshop and time slot");
            return;
        }

        // Validate form
        if (!formData.name || !formData.rollNumber || !formData.email || !formData.phone) {
            toast.error("Please fill in all fields");
            return;
        }

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email");
            return;
        }

        // Validate phone (10 digits)
        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error("Phone number must be 10 digits");
            return;
        }

        setSubmitting(true);

        try {
            const result = await createBooking(
                selectedWorkshop.id,
                selectedSlot.id,
                formData
            );

            if (result.success) {
                toast.success("Registration successful! You're all set.");

                // Reset form
                setFormData({
                    name: "",
                    rollNumber: "",
                    email: "",
                    phone: "",
                });
                setSelectedWorkshop(null);
                setSelectedSlot(null);
                setSlots([]);
            } else {
                toast.error(result.error || "Registration failed");
            }
        } catch (error) {
            console.error("Error submitting registration:", error);
            toast.error("Failed to submit registration. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    function getSlotStatus(slot) {
        if (slot.isClosed) return { label: "Closed", color: "gray" };
        if (slot.remainingSeats === 0) return { label: "Full", color: "red" };
        if (slot.remainingSeats <= 1) return { label: "Almost Full", color: "yellow" };
        return { label: "Open", color: "green" };
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 mx-auto mb-4" />
                    <p className="text-xl text-gray-700">Loading workshops...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4">
            <Toaster position="top-right" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Workshop Registration
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose your workshop and secure your seat
                    </p>
                </div>

                {/* Workshop Selection */}
                {!selectedWorkshop ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {workshops.map((workshop) => (
                            <button
                                key={workshop.id}
                                onClick={() => setSelectedWorkshop(workshop)}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left group"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                                    {workshop.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                    {workshop.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-teal-600">
                                        ₹{workshop.price}
                                    </span>
                                    <span className="text-sm px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                                        15-min slots
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Selected Workshop */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {selectedWorkshop.name}
                                    </h2>
                                    <p className="text-gray-600">{selectedWorkshop.description}</p>
                                    <p className="text-teal-600 font-semibold mt-2">
                                        ₹{selectedWorkshop.price} • 15-minute session
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedWorkshop(null);
                                        setSelectedSlot(null);
                                    }}
                                    className="text-teal-600 hover:text-teal-700 font-medium"
                                >
                                    Change Workshop
                                </button>
                            </div>
                        </div>

                        {/* Slot Selection */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-teal-600" />
                                Select Time Slot
                            </h3>

                            {slots.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Loading slots...</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                    {slots.map((slot) => {
                                        const status = getSlotStatus(slot);
                                        const isSelected = selectedSlot?.id === slot.id;
                                        const isDisabled = slot.isClosed || slot.remainingSeats === 0;

                                        return (
                                            <button
                                                key={slot.id}
                                                onClick={() => !isDisabled && setSelectedSlot(slot)}
                                                disabled={isDisabled}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                        ? "border-teal-600 bg-teal-50"
                                                        : isDisabled
                                                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                                                            : "border-gray-200 hover:border-teal-300 hover:bg-teal-50/50"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        {slot.time}
                                                    </span>
                                                    {isSelected && (
                                                        <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                                                    )}
                                                </div>

                                                {/* Capacity Bar */}
                                                <div className="mb-2">
                                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${status.color === "green"
                                                                    ? "bg-green-500"
                                                                    : status.color === "yellow"
                                                                        ? "bg-yellow-500"
                                                                        : "bg-red-500"
                                                                }`}
                                                            style={{
                                                                width: `${((slot.maxCapacity - slot.remainingSeats) / slot.maxCapacity) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1 text-gray-600">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {slot.remainingSeats}/{slot.maxCapacity} left
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full font-medium ${status.color === "green"
                                                                ? "bg-green-100 text-green-700"
                                                                : status.color === "yellow"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : status.color === "red"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                            }`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Registration Form */}
                        {selectedSlot && (
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white rounded-2xl p-6 shadow-lg space-y-4"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Your Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Roll Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.rollNumber}
                                            onChange={(e) =>
                                                setFormData({ ...formData, rollNumber: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            pattern="\d{10}"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                            placeholder="10 digits"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-teal-600" />
                                        Registration Summary
                                    </h4>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <p>
                                            <span className="font-medium">Workshop:</span>{" "}
                                            {selectedWorkshop.name}
                                        </p>
                                        <p>
                                            <span className="font-medium">Time Slot:</span>{" "}
                                            {selectedSlot.time}
                                        </p>
                                        <p>
                                            <span className="font-medium">Price:</span> ₹
                                            {selectedWorkshop.price}
                                        </p>
                                    </div>
                                </div>

                                {selectedSlot.remainingSeats <= 2 && (
                                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-yellow-900">Hurry! Limited seats</p>
                                            <p className="text-yellow-700">Only {selectedSlot.remainingSeats} seat(s) remaining for this slot</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </span>
                                    ) : (
                                        "Complete Registration"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
