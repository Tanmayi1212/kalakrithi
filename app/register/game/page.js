"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GameRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        teamName: "",
        captainName: "",
        email: "",
        phone: "",
        rollNumber: "",
        college: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Game registration submitted!");
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
                <h1 className="text-4xl font-bold text-blue-800 mb-2 font-lakki-reddy">Game Registration</h1>
                <p className="text-gray-600 mb-8">Fill in your team details to register for a game</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Team Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.teamName}
                            onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Enter your team name"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Captain Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.captainName}
                            onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Team captain's name"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Phone Number *</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="10-digit mobile number"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Roll Number *</label>
                        <input
                            type="text"
                            required
                            value={formData.rollNumber}
                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Your roll number"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">College *</label>
                        <input
                            type="text"
                            required
                            value={formData.college}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Your college name"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Submit Registration
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
        </div>
    );
}
