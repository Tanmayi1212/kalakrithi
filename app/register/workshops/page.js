"use client";

import { useState, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/src/firebase";
import { useRouter } from "next/navigation";
import {
    getWorkshops,
    subscribeToWorkshopSlots,
    createBooking,
    checkDuplicateRegistration
} from "@/src/services/workshopService";
import { uploadPaymentScreenshot } from "@/src/services/storageService";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, Clock, Users, Upload, X, QrCode, Calendar, MapPin, ChevronRight, AlertCircle } from "lucide-react";

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
    const [transactionId, setTransactionId] = useState("");
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

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setPaymentScreenshot(file);

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

        const rollRegex = /^1601\d{8}$/;
        if (!rollRegex.test(formData.rollNumber)) {
            toast.error("Invalid roll number. Must start with 1601 and be 12 digits.");
            return;
        }

        try {
            toast.loading("Checking availability...");
            const duplicateCheck = await checkDuplicateRegistration(selectedWorkshop.id, formData.rollNumber);
            toast.dismiss();

            if (duplicateCheck.exists) {
                toast.error("You have already registered for this workshop.");
                return;
            }
        } catch (error) {
            console.error("Duplicate check failed:", error);
            toast.dismiss();
            toast.error("Failed to verify registration status. Please try again.");
            return;
        }

        setStep("payment");
        toast.success("Details saved! Please complete payment.");
    }

    async function handleFinalSubmit() {
        if (!paymentScreenshot) {
            toast.error("Please upload payment screenshot");
            return;
        }

        if (!transactionId || !transactionId.trim()) {
            toast.error("Please enter Transaction ID / UTR");
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

            toast.loading("Creating your booking...");
            const result = await createBooking(
                selectedWorkshop.id,
                selectedSlot.id,
                {
                    ...formData,
                    paymentScreenshot: screenshotURL,
                    transactionId: transactionId.trim()
                }
            );

            toast.dismiss();

            if (result.success) {
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

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            weekday: "long"
        });
    }

    // Group workshops by day
    const groupedWorkshops = workshops.reduce((acc, ws) => {
        const key = ws.day || "Other";
        if (!acc[key]) {
            acc[key] = {
                dayName: key,
                date: ws.date,
                items: []
            };
        }
        acc[key].items.push(ws);
        return acc;
    }, {});

    // Sort groups by date
    const sortedGroups = Object.values(groupedWorkshops).sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading workshops...</p>
                </div>
            </div>
        );
    }

    if (step === "uploading") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Toaster position="top-right" />
                <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
                        <p className="text-gray-500">Do not refresh or close this page</p>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
                            <span>Uploading Screenshot</span>
                            <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-teal-600 h-2 transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4 font-sans">
            <Toaster position="top-right" />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Workshop Registration
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Join our exclusive folk art workshops. Select a session below to secure your spot.
                    </p>
                </div>

                {!selectedWorkshop ? (
                    <div className="space-y-16">
                        {sortedGroups.map((group) => (
                            <div key={group.dayName} className="animate-fade-in-up">
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-3xl font-bold text-gray-800">
                                        {group.dayName}
                                        {group.date && (
                                            <span className="text-gray-400 font-normal text-2xl ml-3">
                                                — {formatDate(group.date)}
                                            </span>
                                        )}
                                    </h2>
                                    <div className="h-px bg-gray-200 flex-1 ml-4 hidden sm:block"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {group.items.map((workshop) => (
                                        <div
                                            key={workshop.id}
                                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                                    {workshop.name}
                                                </h3>
                                                <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                    {workshop.duration || "1h"}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-grow">
                                                {workshop.description}
                                            </p>

                                            <div className="space-y-3 pt-6 border-t border-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400 text-sm">Price per person</span>
                                                    <span className="text-lg font-bold text-teal-600">
                                                        ₹{workshop.price}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedWorkshop(workshop)}
                                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                                                >
                                                    View Slots
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {workshops.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No workshops available right now.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto animate-fade-in-up">
                        {step === "details" && (
                            <div className="space-y-8">
                                <button
                                    onClick={() => {
                                        setSelectedWorkshop(null);
                                        setSelectedSlot(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors pl-1"
                                >
                                    ← Back to Schedule
                                </button>

                                {/* Selected Workshop Info */}
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedWorkshop.name}</h2>
                                    <p className="text-gray-500 mb-6">{selectedWorkshop.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        {selectedWorkshop.date && (
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Calendar className="w-4 h-4 text-teal-600" />
                                                {formatDate(selectedWorkshop.date)}
                                            </div>
                                        )}
                                        {selectedWorkshop.venue && (
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <MapPin className="w-4 h-4 text-teal-600" />
                                                {selectedWorkshop.venue}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Slot Selection */}
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-teal-600" />
                                        Select Time Slot
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {slots.map((slot) => {
                                            const status = getSlotStatus(slot);
                                            const isSelected = selectedSlot?.id === slot.id;
                                            const isDisabled = slot.isClosed || slot.remainingSeats === 0;

                                            return (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => !isDisabled && setSelectedSlot(slot)}
                                                    disabled={isDisabled}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${isSelected
                                                            ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100 ring-offset-2"
                                                            : isDisabled
                                                                ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                                                : "border-gray-100 hover:border-teal-200 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`font-bold ${isSelected ? 'text-teal-900' : 'text-gray-800'}`}>
                                                            {slot.time}
                                                        </span>
                                                        {isSelected && <CheckCircle className="w-5 h-5 text-teal-600" />}
                                                    </div>

                                                    <div className="flex justify-between items-center mt-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Users className="w-3.5 h-3.5" />
                                                            <span>{slot.remainingSeats} seats left</span>
                                                        </div>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${status.color === "green" ? "bg-green-100 text-green-700" :
                                                                status.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
                                                                    "bg-red-100 text-gray-500"
                                                            }`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {slots.length === 0 && (
                                        <p className="text-gray-500 text-center py-6">Loading slots...</p>
                                    )}
                                </div>

                                {/* User Details Form */}
                                {selectedSlot && (
                                    <form onSubmit={handleDetailsSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Information</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Roll Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.rollNumber}
                                                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="1601..."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="john@example.com"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    pattern="\d{10}"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="9876543210"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full mt-8 py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            Confirm information & Pay
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {step === "payment" && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
                                <button
                                    onClick={() => setStep("details")}
                                    className="text-gray-500 hover:text-gray-900 font-medium mb-8 flex items-center gap-2 transition-colors"
                                >
                                    ← Edit Details
                                </button>

                                <div className="text-center mb-10">
                                    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <QrCode className="w-8 h-8 text-teal-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Payment Step</h2>
                                    <p className="text-gray-500">Scan QR code and upload screenshot to register.</p>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h4>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700 font-medium">{selectedWorkshop.name}</span>
                                        <span className="text-gray-900 font-bold">₹{selectedWorkshop.price}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>{selectedSlot.time}</span>
                                        <span>1 x Ticket</span>
                                    </div>
                                    <div className="h-px bg-gray-200 my-4"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 font-bold">Total Payable</span>
                                        <span className="text-2xl font-bold text-teal-600">₹{selectedWorkshop.price}</span>
                                    </div>
                                </div>

                                {/* QR Code Section */}
                                <div className="text-center mb-8">
                                    <div className="inline-block p-4 rounded-xl border border-gray-200 bg-white mb-4">
                                        <img
                                            src={selectedWorkshop.qrCode || "/qr/payment-qr.svg"}
                                            alt="Payment QR"
                                            className="w-48 h-48 object-contain"
                                        />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">
                                        UPI ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">kalakrithi@upi</span>
                                    </p>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Transaction ID (UTR) *
                                        </label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="Enter 12-digit UTR number"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Payment Screenshot *
                                        </label>

                                        {!screenshotPreview ? (
                                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 cursor-pointer transition-all">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm font-medium text-gray-600">Upload Receipt</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                            </label>
                                        ) : (
                                            <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                                <img src={screenshotPreview} alt="Preview" className="w-full h-48 object-cover" />
                                                <button
                                                    onClick={() => { setPaymentScreenshot(null); setScreenshotPreview(null); }}
                                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={!paymentScreenshot || submitting}
                                        className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {step === "uploading" ? "Processing..." : "Complete Registration"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
