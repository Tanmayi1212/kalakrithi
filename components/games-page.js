"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitGameRegistration } from "@/services/registrations";

const GamesPage = () => {
    const router = useRouter();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState(null);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

    // Mock games data - will be replaced with Firebase data
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setGames([
                {
                    id: "1",
                    title: "Gilli Danda Championship",
                    description: "Test your skills in this traditional Indian stick game. Compete in teams and showcase your precision and power.",
                    category: "Outdoor",
                    teamSize: "4 players",
                    slots: 20,
                    availableSlots: 12,
                    price: 0,
                    icon: "🏏",
                    color: "from-blue-400 to-cyan-500"
                },
                {
                    id: "2",
                    title: "Kabaddi Tournament",
                    description: "Join the ultimate test of strength and strategy. Form teams and compete in this ancient contact sport.",
                    category: "Team Sport",
                    teamSize: "7 players",
                    slots: 16,
                    availableSlots: 8,
                    price: 0,
                    icon: "🤼",
                    color: "from-green-400 to-emerald-500"
                },
                {
                    id: "3",
                    title: "Lagori (Pitthu) Battle",
                    description: "Stack stones and defend! A classic game combining accuracy, teamwork, and quick reflexes.",
                    category: "Outdoor",
                    teamSize: "6 players",
                    slots: 24,
                    availableSlots: 18,
                    price: 0,
                    icon: "🎯",
                    color: "from-yellow-400 to-orange-500"
                },
                {
                    id: "4",
                    title: "Kho-Kho Sprint",
                    description: "Experience the thrill of this fast-paced chasing game. Quick reflexes and team coordination are key!",
                    category: "Team Sport",
                    teamSize: "9 players",
                    slots: 18,
                    availableSlots: 14,
                    price: 0,
                    icon: "🏃",
                    color: "from-red-400 to-pink-500"
                },
                {
                    id: "5",
                    title: "Traditional Pallanguzhi",
                    description: "Engage your strategic mind in this ancient board game from South India. Solo or pair competitions available.",
                    category: "Indoor",
                    teamSize: "1-2 players",
                    slots: 30,
                    availableSlots: 25,
                    price: 0,
                    icon: "🎲",
                    color: "from-purple-400 to-indigo-500"
                },
                {
                    id: "6",
                    title: "Chungi (Footbag) Challenge",
                    description: "Show off your foot-eye coordination in this traditional hacky sack game. Individual and team events.",
                    category: "Outdoor",
                    teamSize: "1-3 players",
                    slots: 25,
                    availableSlots: 20,
                    price: 0,
                    icon: "⚽",
                    color: "from-teal-400 to-blue-500"
                },
                {
                    id: "7",
                    title: "Aadu Puli Attam",
                    description: "Master the tiger and goat strategic board game. Outsmart your opponent in this battle of wits.",
                    category: "Indoor",
                    teamSize: "2 players",
                    slots: 20,
                    availableSlots: 16,
                    price: 0,
                    icon: "🐅",
                    color: "from-orange-400 to-red-500"
                },
                {
                    id: "8",
                    title: "Bamboo Pole Climbing",
                    description: "Test your strength and agility in this traditional climbing competition. Race to the top!",
                    category: "Adventure",
                    teamSize: "1 player",
                    slots: 15,
                    availableSlots: 5,
                    price: 0,
                    icon: "🎋",
                    color: "from-green-500 to-teal-600"
                }
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const handleRegister = (game) => {
        setSelectedGame(game);
        setShowRegistrationModal(true);
    };

    const closeModal = () => {
        setShowRegistrationModal(false);
        setSelectedGame(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700 font-semibold">Loading Games...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header Section */}
            <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-6">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)',
                    }}></div>
                </div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <button
                        onClick={() => router.push('/')}
                        className="mb-6 flex items-center text-white/90 hover:text-white transition-colors group"
                    >
                        <svg className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </button>
                    <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Lakki Reddy', cursive" }}>
                        Arangetra Games
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
                        Rediscover traditional Indian games and sports. Compete, collaborate, and celebrate our rich cultural heritage!
                    </p>
                </div>
            </header>

            {/* Category Filter (Optional for future enhancement) */}
            <div className="max-w-7xl mx-auto px-6 pt-8">
                <div className="flex flex-wrap gap-3 justify-center">
                    {['All', 'Outdoor', 'Indoor', 'Team Sport', 'Adventure'].map((category) => (
                        <button
                            key={category}
                            className="px-6 py-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:scale-105 text-gray-700 font-semibold"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Games Grid */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                        >
                            {/* Game Header */}
                            <div className={`h-40 bg-gradient-to-br ${game.color} relative overflow-hidden`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-7xl opacity-30">{game.icon}</div>
                                </div>
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <span className="text-xs font-bold text-gray-800">{game.category}</span>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <span className="text-sm font-bold text-gray-800">FREE</span>
                                </div>
                            </div>

                            {/* Game Details */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2" style={{ fontFamily: "'Lakki Reddy', cursive" }}>
                                    {game.title}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                                    {game.description}
                                </p>

                                {/* Team Size & Slots */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="font-medium">{game.teamSize}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">{game.availableSlots} / {game.slots} slots</span>
                                    </div>
                                </div>

                                {/* Availability Bar */}
                                <div className="mb-4">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${game.availableSlots < 10 ? 'bg-red-500' : 'bg-green-500'} transition-all`}
                                            style={{ width: `${(game.availableSlots / game.slots) * 100}%` }}
                                        ></div>
                                    </div>
                                    {game.availableSlots < 10 && (
                                        <p className="text-xs text-red-600 mt-1 font-medium">Hurry! Limited slots</p>
                                    )}
                                </div>

                                {/* Register Button */}
                                <button
                                    onClick={() => handleRegister(game)}
                                    disabled={game.availableSlots === 0}
                                    className={`w-full py-2.5 rounded-xl font-bold text-white transition-all transform hover:scale-105 text-sm ${game.availableSlots === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {game.availableSlots === 0 ? 'Full' : 'Register Now'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Registration Modal */}
            {showRegistrationModal && selectedGame && (
                <GameRegistrationModal
                    game={selectedGame}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

// Game Registration Modal Component
const GameRegistrationModal = ({ game, onClose }) => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        teamName: '',
        captainName: '',
        email: '',
        phone: '',
        rollNumber: '',
        college: '',
        teamMembers: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
        setSubmitError(null);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required';
        if (!formData.captainName.trim()) newErrors.captainName = 'Captain name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Phone number must be 10 digits';
        }
        if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
        if (!formData.college.trim()) newErrors.college = 'College name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            const result = await submitGameRegistration({
                gameId: game.id,
                teamName: formData.teamName,
                captainName: formData.captainName,
                email: formData.email,
                phone: formData.phone,
                rollNumber: formData.rollNumber,
                college: formData.college,
                teamMembers: formData.teamMembers
            });

            if (result.success) {
                // Store success data and redirect to success page
                sessionStorage.setItem('registrationSuccess', JSON.stringify({
                    type: 'game',
                    teamName: formData.teamName,
                    captainName: formData.captainName,
                    email: formData.email,
                    gameName: game.title,
                    message: result.message
                }));
                router.push('/register/success');
            } else {
                setSubmitError(result.error);
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitError('An unexpected error occurred. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal Header */}
                <div className={`bg-gradient-to-r ${game.color} text-white p-6 sticky top-0 z-10`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Lakki Reddy', cursive" }}>
                                Register for Game
                            </h2>
                            <p className="text-white/90 text-lg">{game.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Error Alert */}
                    {submitError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-800">{submitError}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Team Name */}
                        <div>
                            <label htmlFor="teamName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Team Name *
                            </label>
                            <input
                                type="text"
                                id="teamName"
                                name="teamName"
                                value={formData.teamName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.teamName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your team name"
                            />
                            {errors.teamName && <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>}
                        </div>

                        {/* Captain Name */}
                        <div>
                            <label htmlFor="captainName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Captain Name *
                            </label>
                            <input
                                type="text"
                                id="captainName"
                                name="captainName"
                                value={formData.captainName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.captainName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Team captain's full name"
                            />
                            {errors.captainName && <p className="text-red-500 text-sm mt-1">{errors.captainName}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="captain@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="10-digit mobile number"
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>

                        {/* Roll Number */}
                        <div>
                            <label htmlFor="rollNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                                Roll Number *
                            </label>
                            <input
                                type="text"
                                id="rollNumber"
                                name="rollNumber"
                                value={formData.rollNumber}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.rollNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Your college roll number"
                            />
                            {errors.rollNumber && <p className="text-red-500 text-sm mt-1">{errors.rollNumber}</p>}
                        </div>

                        {/* College */}
                        <div>
                            <label htmlFor="college" className="block text-sm font-semibold text-gray-700 mb-2">
                                College Name *
                            </label>
                            <input
                                type="text"
                                id="college"
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.college ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Your college name"
                            />
                            {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college}</p>}
                        </div>

                        {/* Team Members */}
                        <div>
                            <label htmlFor="teamMembers" className="block text-sm font-semibold text-gray-700 mb-2">
                                Team Members (Optional)
                            </label>
                            <textarea
                                id="teamMembers"
                                name="teamMembers"
                                value={formData.teamMembers}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                placeholder={`Enter team member names (one per line)\nRequired: ${game.teamSize}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">Team size: {game.teamSize}</p>
                        </div>
                    </div>

                    {/* Game Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-bold text-gray-800 mb-2">Game Summary</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-semibold">Game:</span> {game.title}</p>
                            <p><span className="font-semibold">Category:</span> {game.category}</p>
                            <p><span className="font-semibold">Team Size:</span> {game.teamSize}</p>
                            <p className="text-lg font-bold text-green-600 mt-2">
                                FREE Registration
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Complete Registration'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GamesPage;
