/**
 * Example: Workshop Booking Component
 * 
 * Demonstrates complete workshop booking flow with:
 * - Real-time slot availability
 * - Authentication requirement
 * - Payment integration ready
 */

'use client';

import { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/src/firebase';
import {
    useWorkshops,
    useWorkshopSlots,
    createWorkshopBooking,
    useAuth
} from '@/src/hooks/useFirebase';

export default function WorkshopBooking() {
    const { user } = useAuth();
    const { workshops, loading: workshopsLoading } = useWorkshops();
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const { slots, loading: slotsLoading } = useWorkshopSlots(selectedWorkshop?.id);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rollNumber: '',
        phone: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Auto sign-in anonymously if not authenticated
    const ensureAuthenticated = async () => {
        if (!user) {
            try {
                await signInAnonymously(auth);
                return true;
            } catch (error) {
                console.error('Authentication failed:', error);
                setMessage({ type: 'error', text: 'Authentication failed. Please refresh the page.' });
                return false;
            }
        }
        return true;
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleWorkshopSelect = (workshop) => {
        setSelectedWorkshop(workshop);
        setSelectedSlot(null);
        setMessage({ type: '', text: '' });
    };

    const handleSlotSelect = (slot) => {
        if (!slot.isFull) {
            setSelectedSlot(slot);
            setMessage({ type: '', text: '' });
        }
    };

    const handleBooking = async () => {
        // Validate form
        if (!formData.name || !formData.email || !formData.rollNumber || !formData.phone) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (!selectedWorkshop || !selectedSlot) {
            setMessage({ type: 'error', text: 'Please select a workshop and slot' });
            return;
        }

        setIsProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            // Ensure user is authenticated
            const isAuthenticated = await ensureAuthenticated();
            if (!isAuthenticated) {
                setIsProcessing(false);
                return;
            }

            // Step 1: Process payment (integrate your payment gateway here)
            // For now, we'll simulate a successful payment
            const paymentId = await simulatePayment(selectedWorkshop.price);

            // Step 2: Create booking via Cloud Function
            const result = await createWorkshopBooking({
                workshopId: selectedWorkshop.id,
                slotId: selectedSlot.id,
                name: formData.name,
                email: formData.email,
                rollNumber: formData.rollNumber,
                phone: formData.phone,
                paymentId: paymentId
            });

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `✅ ${result.data.message}\nBooking ID: ${result.data.bookingId}\nRemaining seats: ${result.data.remainingSeats}`
                });

                // Reset form
                setFormData({ name: '', email: '', rollNumber: '', phone: '' });
                setSelectedSlot(null);
            } else {
                setMessage({ type: 'error', text: result.error });
            }

        } catch (error) {
            console.error('Booking error:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Booking failed. Please try again.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Simulate payment (replace with Razorpay/Stripe integration)
    const simulatePayment = async (amount) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`PAYMENT_${Date.now()}`);
            }, 1000);
        });
    };

    if (workshopsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Loading workshops...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Workshop Registration</h1>

            {/* Workshop Selection */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Select a Workshop</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workshops.map((workshop) => (
                        <div
                            key={workshop.id}
                            onClick={() => handleWorkshopSelect(workshop)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedWorkshop?.id === workshop.id
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-300 hover:border-blue-300 hover:shadow'
                                }`}
                        >
                            <h3 className="font-bold text-lg">{workshop.name}</h3>
                            <p className="text-gray-600 text-sm mt-2">{workshop.description}</p>
                            <p className="text-green-600 font-semibold mt-2">₹{workshop.price}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slot Selection */}
            {selectedWorkshop && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Select a Time Slot</h2>
                    {slotsLoading ? (
                        <div className="text-center py-4">Loading slots...</div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No slots available</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {slots.map((slot) => (
                                <button
                                    key={slot.id}
                                    onClick={() => handleSlotSelect(slot)}
                                    disabled={slot.isFull}
                                    className={`p-4 border rounded-lg transition-all ${slot.isFull
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : selectedSlot?.id === slot.id
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : 'border-gray-300 hover:border-blue-300 hover:shadow'
                                        }`}
                                >
                                    <div className="font-semibold">{slot.time}</div>
                                    <div className="text-sm mt-2">
                                        {slot.isFull ? (
                                            <span className="text-red-500 font-bold">FULL</span>
                                        ) : (
                                            <span className="text-green-500">
                                                {slot.remainingSeats}/{slot.maxCapacity} seats available
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
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                        <input
                            type="text"
                            name="rollNumber"
                            placeholder="Roll Number"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (10 digits)"
                            value={formData.phone}
                            onChange={handleInputChange}
                            maxLength="10"
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <button
                        onClick={handleBooking}
                        disabled={isProcessing}
                        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? 'Processing...' : `Book Now - ₹${selectedWorkshop.price}`}
                    </button>
                </div>
            )}

            {/* Message Display */}
            {message.text && (
                <div
                    className={`mt-4 p-4 rounded-lg whitespace-pre-line ${message.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}
