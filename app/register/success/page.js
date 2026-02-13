"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SuccessPage = () => {
    const router = useRouter();
    const [registrationData, setRegistrationData] = useState(null);

    useEffect(() => {
        // Get registration data from session storage
        const data = sessionStorage.getItem('registrationSuccess');
        if (data) {
            setRegistrationData(JSON.parse(data));
            // Clear session storage
            sessionStorage.removeItem('registrationSuccess');
        } else {
            // If no registration data, redirect to home
            router.push('/');
        }
    }, [router]);

    if (!registrationData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700 font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    const isWorkshop = registrationData.type === 'workshop';

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                        <svg className="w-24 h-24 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 018 0z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Lakki Reddy', cursive" }}>
                        Registration Successful!
                    </h1>
                    <p className="text-xl text-gray-600">
                        {registrationData.message || 'Your registration has been confirmed'}
                    </p>
                </div>

                {/* Registration Details Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className={`bg-gradient-to-r ${isWorkshop ? 'from-red-600 to-orange-600' : 'from-blue-600 to-purple-600'} text-white p-6`}>
                        <h2 className="text-3xl font-bold mb-2">
                            {isWorkshop ? '🎨 Workshop Registration' : '🎮 Game Registration'}
                        </h2>
                        <p className="text-white/90">{isWorkshop ? registrationData.workshopName : registrationData.gameName}</p>
                    </div>

                    <div className="p-8">
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Registration Details</h3>
                                <div className="space-y-3">
                                    {isWorkshop ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Participant:</span>
                                                <span className="font-semibold text-gray-900">{registrationData.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Workshop:</span>
                                                <span className="font-semibold text-gray-900">{registrationData.workshopName}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Team Name:</span>
                                                <span className="font-semibold text-gray-900">{registrationData.teamName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Team Captain:</span>
                                                <span className="font-semibold text-gray-900">{registrationData.captainName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Game:</span>
                                                <span className="font-semibold text-gray-900">{registrationData.gameName}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-semibold text-gray-900">{registrationData.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Email Confirmation Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-1">Confirmation Email Sent</h4>
                                        <p className="text-sm text-blue-800">
                                            A confirmation email with all the details has been sent to <strong>{registrationData.email}</strong>. Please check your inbox (and spam folder) for the confirmation email.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                <h4 className="font-semibold text-yellow-900 mb-3">📋 Next Steps:</h4>
                                <ul className="space-y-2 text-sm text-yellow-800">
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Bring your valid College ID Card on the event day</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Save the confirmation email (printed or digital)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Arrive 15-30 minutes before the event starts</span>
                                    </li>
                                    {!isWorkshop && (
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Ensure all team members have their ID cards</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Contact Information */}
                            <div className="text-center pt-4">
                                <p className="text-gray-600 mb-2">Need help or have questions?</p>
                                <a
                                    href="mailto:cbitnss@cbit.ac.in"
                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Contact us at cbitnss@cbit.ac.in
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold rounded-xl hover:from-gray-800 hover:to-black transition-all transform hover:scale-105 shadow-lg"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => router.push(isWorkshop ? '/register/workshop' : '/register/game')}
                        className={`px-8 py-3 bg-gradient-to-r ${isWorkshop ? 'from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700' : 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg`}
                    >
                        Register for More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;
