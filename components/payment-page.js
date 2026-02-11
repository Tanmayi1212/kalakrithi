"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PaymentPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [registrationData, setRegistrationData] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Get registration data from session storage
        const data = sessionStorage.getItem('registrationData');
        if (data) {
            setRegistrationData(JSON.parse(data));
        } else {
            // If no registration data, redirect back
            router.push('/');
        }
    }, [router]);

    const paymentMethods = [
        {
            id: 'phonepe',
            name: 'PhonePe',
            icon: '📱',
            color: 'from-purple-500 to-purple-700',
            description: 'Pay securely with PhonePe UPI'
        },
        {
            id: 'gpay',
            name: 'Google Pay',
            icon: '💳',
            color: 'from-blue-500 to-blue-700',
            description: 'Quick payment via Google Pay'
        },
        {
            id: 'paytm',
            name: 'Paytm',
            icon: '💰',
            color: 'from-cyan-500 to-cyan-700',
            description: 'Pay using Paytm Wallet or UPI'
        }
    ];

    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
    };

    const handleProceedToPayment = () => {
        if (!selectedPaymentMethod) {
            alert('Please select a payment method');
            return;
        }

        setProcessing(true);

        // Simulate payment gateway redirect
        setTimeout(() => {
            // In production, this would redirect to actual payment gateway
            // For now, we'll simulate a successful payment
            sessionStorage.removeItem('registrationData');
            router.push('/payment/success');
        }, 2000);
    };

    if (!registrationData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700 font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    const type = searchParams.get('type');
    const isWorkshop = type === 'workshop';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <svg className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Go Back
                </button>

                {/* Payment Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
                        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Lakki Reddy', cursive" }}>
                            Complete Your Payment
                        </h1>
                        <p className="text-white/90">Choose your preferred payment method</p>
                    </div>

                    {/* Order Summary */}
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
                        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">
                                    {isWorkshop ? 'Workshop' : 'Game'}:
                                </span>
                                <span className="text-gray-900 font-bold">
                                    {isWorkshop ? registrationData.workshop : registrationData.game}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">
                                    {isWorkshop ? 'Participant' : 'Team Captain'}:
                                </span>
                                <span className="text-gray-900">
                                    {isWorkshop ? registrationData.name : registrationData.captainName}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Email:</span>
                                <span className="text-gray-900">{registrationData.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Roll Number:</span>
                                <span className="text-gray-900">{registrationData.rollNumber}</span>
                            </div>
                            <div className="border-t-2 border-gray-200 pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                                    <span className="text-3xl font-bold text-indigo-600">₹{registrationData.amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Payment Method</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => handlePaymentMethodSelect(method.id)}
                                className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${selectedPaymentMethod === method.id
                                        ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                    }`}
                            >
                                <div className="text-5xl mb-3">{method.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{method.name}</h3>
                                <p className="text-sm text-gray-600">{method.description}</p>
                                {selectedPaymentMethod === method.id && (
                                    <div className="mt-3 flex items-center justify-center text-indigo-600">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="ml-2 font-semibold">Selected</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start">
                            <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">Secure Payment</h4>
                                <p className="text-sm text-blue-800">
                                    Your payment is secured with 256-bit encryption. You will be redirected to the payment gateway to complete the transaction.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                        onClick={handleProceedToPayment}
                        disabled={!selectedPaymentMethod || processing}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all transform hover:scale-105 ${!selectedPaymentMethod || processing
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {processing ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Pay ₹${registrationData.amount}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
