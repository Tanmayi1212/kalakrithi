"use client";

import { useState, useEffect } from "react";
import { subscribeToConfirmedBookings, markAttendance } from "@/src/utils/adminService";
import { exportBookingsCSV } from "@/src/utils/csvExport";
import { generateBookingQR, downloadQRCode } from "@/src/utils/qrGenerator";
import { getCurrentAdmin } from "@/src/utils/adminAuth";
import toast from "react-hot-toast";

export default function BookingsTable() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [workshopFilter, setWorkshopFilter] = useState("all");
    const [slotFilter, setSlotFilter] = useState("all");
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        loadAdminUser();
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToConfirmedBookings((data) => {
            setBookings(data);
            setFilteredBookings(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, workshopFilter, slotFilter, bookings]);

    async function loadAdminUser() {
        const { user } = await getCurrentAdmin();
        setAdminUser(user);
    }

    function applyFilters() {
        let filtered = [...bookings];

        // Search by roll number
        if (searchTerm) {
            filtered = filtered.filter((booking) =>
                booking.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by workshop
        if (workshopFilter !== "all") {
            filtered = filtered.filter((booking) => booking.workshopName === workshopFilter);
        }

        // Filter by slot
        if (slotFilter !== "all") {
            filtered = filtered.filter((booking) => booking.slotTime === slotFilter);
        }

        setFilteredBookings(filtered);
    }

    async function handleShowQR(booking) {
        setSelectedBooking(booking);
        try {
            const qrDataURL = await generateBookingQR(booking);
            setQrCode(qrDataURL);
            setShowQRModal(true);
        } catch (error) {
            toast.error("Failed to generate QR code");
        }
    }

    function handleExportCSV() {
        const result = exportBookingsCSV(filteredBookings);
        if (result.success) {
            toast.success("CSV exported successfully!");
        } else {
            toast.error(result.error || "Failed to export CSV");
        }
    }

    // Get unique workshops and slots for filters
    const uniqueWorkshops = [...new Set(bookings.map((b) => b.workshopName))];
    const uniqueSlots = [...new Set(bookings.map((b) => b.slotTime))];

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Confirmed Bookings</h1>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Confirmed Bookings</h1>
                    <p className="text-sm text-gray-600 mt-1">View and manage confirmed registrations</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
                        {filteredBookings.length} Total
                    </div>
                    <button
                        onClick={handleExportCSV}
                        disabled={filteredBookings.length === 0}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search by Roll Number
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter roll number..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        />
                    </div>

                    {/* Workshop Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Workshop
                        </label>
                        <select
                            value={workshopFilter}
                            onChange={(e) => setWorkshopFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        >
                            <option value="all">All Workshops</option>
                            {uniqueWorkshops.map((workshop) => (
                                <option key={workshop} value={workshop}>
                                    {workshop}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Slot Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Slot
                        </label>
                        <select
                            value={slotFilter}
                            onChange={(e) => setSlotFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        >
                            <option value="all">All Slots</option>
                            {uniqueSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
                    <p className="text-gray-600">
                        {bookings.length === 0
                            ? "No confirmed bookings yet"
                            : "Try adjusting your filters"}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Roll Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Workshop
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Slot
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Confirmed At
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {booking.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.rollNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{booking.workshopName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {booking.slotTime}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                            {booking.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {booking.confirmedAt
                                                ? new Date(booking.confirmedAt).toLocaleDateString("en-IN", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleShowQR(booking)}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                            >
                                                View QR
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQRModal && selectedBooking && qrCode && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Booking QR Code</h2>
                            <button
                                onClick={() => {
                                    setShowQRModal(false);
                                    setSelectedBooking(null);
                                    setQrCode(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="text-center">
                            <img src={qrCode} alt="Booking QR Code" className="mx-auto mb-4" />
                            <div className="mb-4 p-4 bg-gray-50 rounded-xl text-left">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Name:</span> {selectedBooking.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Roll Number:</span> {selectedBooking.rollNumber}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Workshop:</span> {selectedBooking.workshopName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Slot:</span> {selectedBooking.slotTime}
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    downloadQRCode(
                                        qrCode,
                                        `${selectedBooking.rollNumber}-${selectedBooking.workshopName}-qr.png`
                                    )
                                }
                                className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
                            >
                                Download QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
