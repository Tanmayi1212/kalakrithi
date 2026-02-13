"use client";

import { useState, useEffect } from "react";
import {
    getWorkshopsWithSlots,
    updateSlotCapacity,
    toggleSlotStatus,
} from "@/src/utils/adminService";
import toast from "react-hot-toast";

export default function SlotManager() {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSlot, setEditingSlot] = useState(null);
    const [newCapacity, setNewCapacity] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        loadWorkshops();
    }, []);

    async function loadWorkshops() {
        setLoading(true);
        const data = await getWorkshopsWithSlots();
        setWorkshops(data);
        setLoading(false);
    }

    function handleEditClick(workshop, slot) {
        setSelectedSlot({ ...slot, workshopId: workshop.id, workshopName: workshop.name });
        setNewCapacity(String(slot.maxCapacity || 30));
        setShowEditModal(true);
    }

    async function handleSaveCapacity() {
        if (!selectedSlot) return;

        const capacity = parseInt(newCapacity);
        if (isNaN(capacity) || capacity <= 0) {
            toast.error("Please enter a valid capacity");
            return;
        }

        const result = await updateSlotCapacity(
            selectedSlot.workshopId,
            selectedSlot.id,
            capacity
        );

        if (result.success) {
            setShowEditModal(false);
            setSelectedSlot(null);
            loadWorkshops();
        }
    }

    function handleToggleClick(workshop, slot) {
        setSelectedSlot({ ...slot, workshopId: workshop.id, workshopName: workshop.name });
        setShowCloseModal(true);
    }

    async function handleToggleSlot() {
        if (!selectedSlot) return;

        const result = await toggleSlotStatus(
            selectedSlot.workshopId,
            selectedSlot.id,
            !selectedSlot.isClosed
        );

        if (result.success) {
            setShowCloseModal(false);
            setSelectedSlot(null);
            loadWorkshops();
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Slot Management</h1>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                            <div className="h-24 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Slot Management</h1>
                <button
                    onClick={loadWorkshops}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    <span>Refresh</span>
                </button>
            </div>

            {/* Workshops List */}
            {workshops.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <h2 className=" text-2xl font-bold text-gray-800 mb-2">No Workshops Yet</h2>
                    <p className="text-gray-600">Add workshops to Firebase to get started</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {workshops.map((workshop) => (
                        <div key={workshop.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Workshop Header */}
                            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
                                <h2 className="text-2xl font-bold">{workshop.name}</h2>
                                <p className="text-white/90">{workshop.description || "Workshop description"}</p>
                            </div>

                            {/* Slots */}
                            {workshop.slots && workshop.slots.length > 0 ? (
                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {workshop.slots.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-800">{slot.time}</h3>
                                                        {slot.isClosed && (
                                                            <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">
                                                                CLOSED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditClick(workshop, slot)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleClick(workshop, slot)}
                                                            className={`px-3 py-1.5 text-white text-sm rounded-lg transition-all ${slot.isClosed
                                                                    ? "bg-green-600 hover:bg-green-700"
                                                                    : "bg-gray-600 hover:bg-gray-700"
                                                                }`}
                                                        >
                                                            {slot.isClosed ? "Open" : "Close"}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Capacity Stats */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Max Capacity:</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {slot.maxCapacity || 30}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Current Bookings:</span>
                                                        <span className="font-semibold text-blue-600">
                                                            {slot.currentBookings}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Remaining Seats:</span>
                                                        <span
                                                            className={`font-semibold ${slot.remainingSeats > 5
                                                                    ? "text-green-600"
                                                                    : slot.remainingSeats > 0
                                                                        ? "text-orange-600"
                                                                        : "text-red-600"
                                                                }`}
                                                        >
                                                            {slot.remainingSeats}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-4">
                                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${slot.isFull
                                                                    ? "bg-red-500"
                                                                    : slot.remainingSeats <= 5
                                                                        ? "bg-orange-500"
                                                                        : "bg-green-500"
                                                                }`}
                                                            style={{
                                                                width: `${(slot.currentBookings / (slot.maxCapacity || 30)) * 100
                                                                    }%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            {((slot.currentBookings / (slot.maxCapacity || 30)) * 100).toFixed(
                                                                0
                                                            )}
                                                            % Full
                                                        </span>
                                                        {slot.isFull && (
                                                            <span className="text-xs font-bold text-red-600">FULL</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <p>No slots configured for this workshop</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Capacity Modal */}
            {showEditModal && selectedSlot && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Slot Capacity</h2>
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Workshop:</span> {selectedSlot.workshopName}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Slot:</span> {selectedSlot.time}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Current Bookings:</span>{" "}
                                {selectedSlot.currentBookings}
                            </p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Max Capacity
                            </label>
                            <input
                                type="number"
                                value={newCapacity}
                                onChange={(e) => setNewCapacity(e.target.value)}
                                min={selectedSlot.currentBookings}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                placeholder="Enter new capacity"
                            />
                            {parseInt(newCapacity) < selectedSlot.currentBookings && (
                                <p className="text-red-600 text-sm mt-2">
                                    Capacity cannot be less than current bookings ({selectedSlot.currentBookings})
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSaveCapacity}
                                disabled={parseInt(newCapacity) < selectedSlot.currentBookings}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedSlot(null);
                                }}
                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Slot Status Modal */}
            {showCloseModal && selectedSlot && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            {selectedSlot.isClosed ? "Open Slot?" : "Close Slot?"}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to {selectedSlot.isClosed ? "open" : "close"} the slot{" "}
                            <span className="font-semibold">{selectedSlot.time}</span> for{" "}
                            <span className="font-semibold">{selectedSlot.workshopName}</span>?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleToggleSlot}
                                className={`flex-1 py-3 text-white rounded-xl font-semibold ${selectedSlot.isClosed
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                Yes, {selectedSlot.isClosed ? "Open" : "Close"} It
                            </button>
                            <button
                                onClick={() => {
                                    setShowCloseModal(false);
                                    setSelectedSlot(null);
                                }}
                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
