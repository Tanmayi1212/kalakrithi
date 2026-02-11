"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const WorkshopsPage = () => {
    const router = useRouter();
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

    // Mock workshop data - will be replaced with API call
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setWorkshops([
                {
                    id: 1,
                    title: "Madhubani Painting",
                    description: "Learn the ancient art of Madhubani painting from Bihar, featuring intricate patterns and vibrant colors.",
                    instructor: "Priya Kumari",
                    duration: "2 hours",
                    slots: 30,
                    availableSlots: 15,
                    price: 299,
                    image: "/madhubani.jpg",
                    color: "from-orange-400 to-red-500"
                },
                {
                    id: 2,
                    title: "Warli Art",
                    description: "Discover the tribal art form of Warli from Maharashtra, known for its simplistic yet beautiful designs.",
                    instructor: "Ramesh Patil",
                    duration: "2.5 hours",
                    slots: 25,
                    availableSlots: 20,
                    price: 349,
                    image: "/warli.jpg",
                    color: "from-green-400 to-teal-500"
                },
                {
                    id: 3,
                    title: "Kolam Designs",
                    description: "Master the art of creating beautiful Kolam patterns, a traditional South Indian floor decoration.",
                    instructor: "Lakshmi Iyer",
                    duration: "1.5 hours",
                    slots: 40,
                    availableSlots: 35,
                    price: 249,
                    image: "/kolam.jpg",
                    color: "from-pink-400 to-purple-500"
                },
                {
                    id: 4,
                    title: "Gond Tribal Art",
                    description: "Explore the vibrant Gond art style from Madhya Pradesh with its signature dots and dashes.",
                    instructor: "Venkat Shyam",
                    duration: "3 hours",
                    slots: 20,
                    availableSlots: 8,
                    price: 399,
                    image: "/gond.jpg",
                    color: "from-blue-400 to-indigo-500"
                },
                {
                    id: 5,
                    title: "Pattachitra Painting",
                    description: "Learn the classical Pattachitra cloth-based scroll painting from Odisha and West Bengal.",
                    instructor: "Sudarsan Pattnaik",
                    duration: "2 hours",
                    slots: 30,
                    availableSlots: 25,
                    price: 329,
                    image: "/pattachitra.jpg",
                    color: "from-yellow-400 to-orange-500"
                },
                {
                    id: 6,
                    title: "Kalamkari Art",
                    description: "Experience the traditional Kalamkari hand-painting technique using natural dyes from Andhra Pradesh.",
                    instructor: "Nirmala Reddy",
                    duration: "2.5 hours",
                    slots: 25,
                    availableSlots: 18,
                    price: 379,
                    image: "/kalamkari.jpg",
                    color: "from-red-400 to-pink-500"
                }
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const handleRegister = (workshop) => {
        setSelectedWorkshop(workshop);
        setShowRegistrationModal(true);
    };

    const closeModal = () => {
        setShowRegistrationModal(false);
        setSelectedWorkshop(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700 font-semibold">Loading Workshops...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            {/* Header Section */}
            <header className="relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 text-white py-20 px-6">
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
                        Kalakrithi Workshops
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
                        Immerse yourself in traditional Indian folk art forms. Learn from master artists and create your own masterpiece.
                    </p>
                </div>
            </header>

            {/* Workshops Grid */}
            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {workshops.map((workshop) => (
                        <div
                            key={workshop.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                        >
                            {/* Workshop Image */}
                            <div className={`h-48 bg-gradient-to-br ${workshop.color} relative overflow-hidden`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white text-6xl opacity-20">🎨</div>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <span className="text-sm font-bold text-gray-800">₹{workshop.price}</span>
                                </div>
                            </div>

                            {/* Workshop Details */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Lakki Reddy', cursive" }}>
                                    {workshop.title}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                                    {workshop.description}
                                </p>

                                {/* Instructor & Duration */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="font-medium">{workshop.instructor}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{workshop.duration}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="font-medium">{workshop.availableSlots} / {workshop.slots} slots available</span>
                                    </div>
                                </div>

                                {/* Availability Bar */}
                                <div className="mb-4">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${workshop.availableSlots < 10 ? 'bg-red-500' : 'bg-green-500'} transition-all`}
                                            style={{ width: `${(workshop.availableSlots / workshop.slots) * 100}%` }}
                                        ></div>
                                    </div>
                                    {workshop.availableSlots < 10 && (
                                        <p className="text-xs text-red-600 mt-1 font-medium">Filling fast!</p>
                                    )}
                                </div>

                                {/* Register Button */}
                                <button
                                    onClick={() => handleRegister(workshop)}
                                    disabled={workshop.availableSlots === 0}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 ${workshop.availableSlots === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {workshop.availableSlots === 0 ? 'Sold Out' : 'Register Now'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Registration Modal */}
            {showRegistrationModal && selectedWorkshop && (
                <RegistrationModal
                    workshop={selectedWorkshop}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

// Registration Modal Component
const RegistrationModal = ({ workshop, onClose }) => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        rollNumber: '',
        college: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

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
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
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

        // Simulate API call
        setTimeout(() => {
            // Store registration data in session storage
            sessionStorage.setItem('registrationData', JSON.stringify({
                ...formData,
                workshop: workshop.title,
                workshopId: workshop.id,
                amount: workshop.price
            }));

            // Redirect to payment page
            router.push('/payment?type=workshop&id=' + workshop.id);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal Header */}
                <div className={`bg-gradient-to-r ${workshop.color} text-white p-6 sticky top-0 z-10`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Lakki Reddy', cursive" }}>
                                Register for Workshop
                            </h2>
                            <p className="text-white/90 text-lg">{workshop.title}</p>
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
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your full name"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="your.email@example.com"
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
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300'
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
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${errors.rollNumber ? 'border-red-500' : 'border-gray-300'
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
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${errors.college ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Your college name"
                            />
                            {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college}</p>}
                        </div>
                    </div>

                    {/* Workshop Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-bold text-gray-800 mb-2">Workshop Summary</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-semibold">Workshop:</span> {workshop.title}</p>
                            <p><span className="font-semibold">Instructor:</span> {workshop.instructor}</p>
                            <p><span className="font-semibold">Duration:</span> {workshop.duration}</p>
                            <p className="text-lg font-bold text-gray-800 mt-2">
                                Total Amount: ₹{workshop.price}
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            'Proceed to Payment'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WorkshopsPage;
