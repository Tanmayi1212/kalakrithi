"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SuccessPage = () => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Success Icon */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-12 text-center">
                        <div className="inline-block">
                            <div className="bg-white rounded-full p-6 mb-4 animate-bounce">
                                <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Lakki Reddy', cursive" }}>
                            Registration Successful!
                        </h1>
                        <p className="text-xl text-white/90">Your payment has been processed</p>
                    </div>

                    {/* Success Content */}
                    <div className="p-8 md:p-12">
                        <div className="text-center mb-8">
                            <p className="text-lg text-gray-700 mb-4">
                                🎉 Congratulations! You have successfully registered.
                            </p>
                            <p className="text-gray-600">
                                A confirmation email has been sent to your registered email address with all the details.
                            </p>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">What's Next?</h2>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Check your email for confirmation and event details</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Save your registration ID for future reference</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Mark your calendar for the event date and time</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Arrive 15 minutes early on the event day</span>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
                            <p className="text-gray-700 mb-2">Need help? Contact us:</p>
                            <p className="text-lg font-semibold text-indigo-600">support@kalakrithi.com</p>
                            <p className="text-gray-600 mt-1">+91 XXXXX XXXXX</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Back to Home
                            </button>
                            <button
                                onClick={() => router.push('/workshops')}
                                className="flex-1 py-4 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all transform hover:scale-105"
                            >
                                Browse More Events
                            </button>
                        </div>

                        {/* Auto Redirect Countdown */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Redirecting to home in <span className="font-bold text-indigo-600">{countdown}</span> seconds...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Social Share (Optional) */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">Share your excitement!</p>
                    <div className="flex justify-center gap-4">
                        <button className="w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all transform hover:scale-110 flex items-center justify-center">
                            <span className="text-xl">📘</span>
                        </button>
                        <button className="w-12 h-12 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-all transform hover:scale-110 flex items-center justify-center">
                            <span className="text-xl">📷</span>
                        </button>
                        <button className="w-12 h-12 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-all transform hover:scale-110 flex items-center justify-center">
                            <span className="text-xl">🐦</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;
