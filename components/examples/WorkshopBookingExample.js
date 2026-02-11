// Example: Workshop Booking Component
// This file demonstrates how to integrate Firebase hooks for workshop booking

'use client';

import { useState, useEffect } from 'react';
import { useWorkshops, useWorkshopSlots, createWorkshopBookingOrder, verifyWorkshopPayment } from '@/lib/firebaseHooks';

export default function WorkshopBooking() {
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

    const handleProceedToPay = async () => {
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
            // Step 1: Create booking order (validates capacity and duplicate)
            const orderResult = await createWorkshopBookingOrder({
                workshopId: selectedWorkshop.id,
                slotId: selectedSlot.id,
                name: formData.name,
                email: formData.email,
                rollNumber: formData.rollNumber,
                phone: formData.phone
            });

            if (!orderResult.success) {
                setMessage({ type: 'error', text: orderResult.error });
                setIsProcessing(false);
                return;
            }

            // Step 2: Initiate payment (integrate your payment gateway here)
            // For demonstration, we'll simulate payment success
            const paymentId = await simulatePayment(orderResult.data.orderId, orderResult.data.price);

            // Step 3: Verify payment and complete booking
            const verifyResult = await verifyWorkshopPayment({
                workshopId: selectedWorkshop.id,
                slotId: selectedSlot.id,
                name: formData.name,
                email: formData.email,
                rollNumber: formData.rollNumber,
                phone: formData.phone,
                paymentId: paymentId
            });

            if (verifyResult.success) {
                setMessage({
                    type: 'success',
                    text: `Booking confirmed! Your booking ID is: ${verifyResult.data.bookingId}`
                });

                // Reset form
                setFormData({ name: '', email: '', rollNumber: '', phone: '' });
                setSelectedSlot(null);
            } else {
                setMessage({ type: 'error', text: verifyResult.error });
            }

        } catch (error) {
            console.error('Booking error:', error);
            setMessage({ type: 'error', text: error.message || 'Booking failed. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    // Simulate payment (replace with actual payment gateway integration)
    const simulatePayment = async (orderId, amount) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`PAYMENT_${Date.now()}`);
            }, 1000);
        });
    };

    if (workshopsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading workshops...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Workshop Registration</h1>

            {/* Step 1: Select Workshop */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Select a Workshop</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workshops.map((workshop) => (
                        <div
                            key={workshop.id}
                            onClick={() => handleWorkshopSelect(workshop)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedWorkshop?.id === workshop.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-300'
                                }`}
                        >
                            <h3 className="font-bold text-lg">{workshop.name}</h3>
                            <p className="text-gray-600 text-sm mt-2">{workshop.description}</p>
                            <p className="text-green-600 font-semibold mt-2">₹{workshop.price}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 2: Select Slot */}
            {selectedWorkshop && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Select a Time Slot</h2>
                    {slotsLoading ? (
                        <p>Loading slots...</p>
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
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="font-semibold">{slot.time}</div>
                                    <div className="text-sm mt-2">
                                        {slot.isFull ? (
                                            <span className="text-red-500">FULL</span>
                                        ) : (
                                            <span className="text-green-500">
                                                {slot.remainingSeats} seats left
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Fill Details */}
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
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            name="rollNumber"
                            placeholder="Roll Number"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>

                    <button
                        onClick={handleProceedToPay}
                        disabled={isProcessing}
                        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? 'Processing...' : `Proceed to Pay ₹${selectedWorkshop.price}`}
                    </button>
                </div>
            )}

            {/* Message Display */}
            {message.text && (
                <div
                    className={`mt-4 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}
