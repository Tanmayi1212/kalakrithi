"use client";

import { useState, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/src/firebase";
import { useRouter } from "next/navigation";
import {
    getWorkshops,
    subscribeToWorkshopSlots,
    createBooking,
} from "@/src/services/workshopService";
import { uploadPaymentScreenshot } from "@/src/services/storageService";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, Clock, Users, Upload, X, QrCode } from "lucide-react";

export default function WorkshopRegistration() {
    const router = useRouter();
    const [workshops, setWorkshops] = useState([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Multi-step state: 'details' | 'payment' | 'uploading'
    const [step, setStep] = useState("details");
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

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
            const unsubscribe = subscribeToWorkshopSlots(selectedWorkshop.id, (updatedSlots) => {
                setSlots(updatedSlots);
            });
            return () => unsubscribe();
        }
    }, [selectedWorkshop]);

    async function init() {
        try {
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }

            const workshopsData = await getWorkshops();
            setWorkshops(workshopsData);
            setLoading(false);
        } catch (error) {
            console.error("❌ INIT ERROR:", error);
            toast.error("Failed to load workshops");
            setLoading(false);
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setPaymentScreenshot(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setScreenshotPreview(reader.result);
        };
        reader.readAsDataURL(file);

        toast.success("Payment screenshot selected");
    }

    async function handleDetailsSubmit(e) {
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

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email");
            return;
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error("Phone number must be 10 digits");
            return;
        }

        // Proceed to payment step
        setStep("payment");
        toast.success("Details saved! Please complete payment.");
    }

    async function handleFinalSubmit() {
        if (!paymentScreenshot) {
            toast.error("Please upload payment screenshot");
            return;
        }

        if (!selectedWorkshop || !selectedSlot) {
            toast.error("Session expired. Please refresh.");
            return;
        }

        setSubmitting(true);
        setStep("uploading");
        setUploadProgress(0);

        try {
            // Upload screenshot with progress tracking
            const screenshotURL = await uploadPaymentScreenshot(
                paymentScreenshot,
                selectedWorkshop.id,
                selectedSlot.id,
                formData.rollNumber,
                (progress) => {
                    setUploadProgress(progress);
                }
            );
            toast.success("Screenshot uploaded!");

            // Create booking
            toast.loading("Creating your booking...");
            const result = await createBooking(
                selectedWorkshop.id,
                selectedSlot.id,
                {
                    ...formData,
                    paymentScreenshot: screenshotURL,
                }
            );

            toast.dismiss();

            if (result.success) {
                // Store success data for the success page
                sessionStorage.setItem('registrationSuccess', JSON.stringify({
                    type: 'workshop',
                    workshopName: selectedWorkshop.name,
                    name: formData.name,
                    email: formData.email,
                    rollNumber: formData.rollNumber,
                    slotTime: selectedSlot.time,
                    message: "Your workshop registration has been submitted successfully."
                }));

                toast.success("Registration successful!");
                router.push("/register/success");
            } else {
                toast.error(result.error || "Registration failed");
                setStep("payment");
                setUploadProgress(0);
            }
        } catch (error) {
            console.error("Error submitting registration:", error);
            toast.error("Failed to submit registration. Please try again.");
            setStep("payment");
            setUploadProgress(0);
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

    // Uploading Step - Show Progress
    if (step === "uploading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
                <Toaster position="top-right" />
                <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
                        <p className="text-gray-600">Uploading your payment screenshot</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Upload Progress</span>
                            <span className="font-semibold">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Please wait while we compress and upload your screenshot...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4">
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Workshop Registration
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose your workshop and complete payment
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
                                <div className="mb-3 space-y-1">
                                    {workshop.venue && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="font-semibold">Venue:</span> {workshop.venue}
                                        </p>
                                    )}
                                    {workshop.date && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="font-semibold">Date:</span> {workshop.date}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-teal-600">
                                        ₹{workshop.price}
                                    </span>
                                    <span className="text-sm px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                                        {workshop.duration || "1 Hour"}
                                    </span>
                                </div>
                            </button>
                        ))}
                        {workshops.length === 0 && (
                            <div className="col-span-3 text-center text-gray-500 py-10">
                                No active workshops found.
                            </div>
                        )}
                    </div>
                ) : step === "payment" ? (
                    // Payment Step
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <button
                                onClick={() => setStep("details")}
                                className="text-teal-600 hover:text-teal-700 font-medium mb-6 flex items-center gap-2"
                            >
                                ← Back to Details
                            </button>

                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                                    <QrCode className="w-8 h-8 text-teal-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
                                <p className="text-gray-600">Scan QR code and upload payment screenshot</p>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-8">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Workshop</p>
                                        <p className="font-semibold text-gray-900">{selectedWorkshop.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Time Slot</p>
                                        <p className="font-semibold text-gray-900">{selectedSlot.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Student</p>
                                        <p className="font-semibold text-gray-900">{formData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Amount</p>
                                        <p className="text-2xl font-bold text-teal-600">₹{selectedWorkshop.price}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-8">
                                <div className="text-center">
                                    <img
                                        src={selectedWorkshop.qrCode || "/qr/payment-qr.svg"}
                                        alt={`QR Code for ${selectedWorkshop.name}`}
                                        className="w-64 h-auto mx-auto mb-4 object-contain"
                                    />
                                    <p className="text-sm text-gray-600">Scan this QR code to make payment via UPI</p>
                                    <p className="text-xs text-gray-500 mt-2">Amount: ₹{selectedWorkshop.price}</p>
                                </div>
                            </div>

                            {/* Screenshot Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Upload Payment Screenshot *
                                </label>

                                {!screenshotPreview ? (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-500 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="text-sm font-medium text-gray-700">Click to upload screenshot</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </label>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={screenshotPreview}
                                            alt="Payment screenshot preview"
                                            className="w-full h-64 object-contain bg-gray-100 rounded-xl"
                                        />
                                        <button
                                            onClick={() => {
                                                setPaymentScreenshot(null);
                                                setScreenshotPreview(null);
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleFinalSubmit}
                                disabled={!paymentScreenshot || submitting}
                                className="w-full mt-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {step === "uploading" ? "Processing..." : "Complete Registration"}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Details Step
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {selectedWorkshop.name}
                                    </h2>
                                    <p className="text-gray-600">{selectedWorkshop.description}</p>
                                    <p className="text-teal-600 font-semibold mt-2">
                                        ₹{selectedWorkshop.price} • {selectedWorkshop.duration || "1 Hour"}
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

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-teal-600" />
                                Select Time Slot
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
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
                                                    : "border-gray-200 hover:border-teal-300"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="font-semibold text-gray-900">{slot.time}</span>
                                                {isSelected && <CheckCircle className="w-5 h-5 text-teal-600" />}
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600 flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {slot.remainingSeats}/{slot.maxCapacity}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full font-medium ${status.color === "green" ? "bg-green-100 text-green-700" :
                                                    status.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-red-100 text-red-700"
                                                    }`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedSlot && (
                            <form onSubmit={handleDetailsSubmit} className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.rollNumber}
                                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            pattern="\d{10}"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="10 digits"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-semibold transition-all shadow-lg hover:shadow-xl"
                                >
                                    Proceed to Payment →
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
