/**
 * Workshop Registration Page (No Payment)
 * Simple registration form that collects user information
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkshops, useWorkshopSlots } from "@/src/hooks/useFirebase";

export default function WorkshopRegister() {
    const router = useRouter();
    const { workshops, loading: workshopsLoading } = useWorkshops();

    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const { slots, loading: slotsLoading } = useWorkshopSlots(selectedWorkshop?.id);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        rollNumber: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!selectedWorkshop || !selectedSlot) {
            setMessage({ type: "error", text: "Please select a workshop and time slot" });
            return;
        }

        if (!formData.name || !formData.email || !formData.rollNumber || !formData.phone) {
            setMessage({ type: "error", text: "Please fill in all fields" });
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setMessage({ type: "error", text: "Please enter a valid email address" });
            return;
        }

        // Validate phone
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            setMessage({ type: "error", text: "Phone number must be 10 digits" });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            // Here you can add logic to save to Firestore or send to an API
            // For now, just show success message
            console.log("Registration data:", {
                workshop: selectedWorkshop.name,
                slot: selectedSlot.time,
                ...formData
            });

            setMessage({
                type: "success",
                text: `Successfully registered for ${selectedWorkshop.name}! We'll contact you soon.`
            });

            // Clear form after 2 seconds
            setTimeout(() => {
                router.push("/");
            }, 2000);

        } catch (error) {
            console.error("Registration error:", error);
            setMessage({
                type: "error",
                text: "Failed to submit registration. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (workshopsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">Loading workshops...</p>
                </div>
            </div>
        );
    }

    if (!workshops || workshops.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">No Workshops Available</h2>
                    <p className="text-gray-600 mb-6">
                        Workshops haven't been added yet. Please check back later!
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-red-800 mb-2 font-lakki-reddy text-center">
                    Workshop Registration
                </h1>
                <p className="text-gray-600 mb-8 text-center">
                    Select a workshop and register your interest
                </p>

                {/* Workshop Selection */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Select a Workshop</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {workshops.map((workshop) => (
                            <div
                                key={workshop.id}
                                onClick={() => {
                                    setSelectedWorkshop(workshop);
                                    setSelectedSlot(null);
                                    setMessage({ type: "", text: "" });
                                }}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedWorkshop?.id === workshop.id
                                        ? "border-red-500 bg-red-50 shadow-lg"
                                        : "border-gray-300 hover:border-red-300 hover:shadow-md"
                                    }`}
                            >
                                <h3 className="font-bold text-lg text-gray-800">{workshop.name}</h3>
                                <p className="text-gray-600 text-sm mt-2">{workshop.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slot Selection */}
                {selectedWorkshop && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Time Slot</h2>
                        {slotsLoading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                No slots available for this workshop
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {slots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => {
                                            if (!slot.isFull) {
                                                setSelectedSlot(slot);
                                                setMessage({ type: "", text: "" });
                                            }
                                        }}
                                        disabled={slot.isFull}
                                        className={`p-4 border-2 rounded-xl transition-all ${slot.isFull
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                                                : selectedSlot?.id === slot.id
                                                    ? "border-red-500 bg-red-50 shadow-lg"
                                                    : "border-gray-300 hover:border-red-300 hover:shadow-md"
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-800">{slot.time}</div>
                                        <div className="text-sm mt-2">
                                            {slot.isFull ? (
                                                <span className="text-red-500 font-bold">FULL</span>
                                            ) : (
                                                <span className="text-green-600">
                                                    {slot.remainingSeats}/{slot.maxCapacity} seats left
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Registration Form */}
                {selectedSlot && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Details</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    Roll Number *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.rollNumber}
                                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    placeholder="Your roll number"
                                />
                            </div>

                            {message.text && (
                                <div
                                    className={`p-4 rounded-xl border-2 ${message.type === "error"
                                            ? "bg-red-50 text-red-800 border-red-300"
                                            : "bg-green-50 text-green-800 border-green-300"
                                        }`}
                                >
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xl font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Submitting..." : "Register Now"}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                className="w-full py-3 bg-gray-200 text-gray-700 text-lg font-semibold rounded-xl hover:bg-gray-300 transition-all"
                            >
                                Back to Home
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
