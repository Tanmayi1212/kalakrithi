"use client";

import { useState, useEffect } from "react";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase";

export default function AdminDebugPage() {
    const [bookings, setBookings] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAllData();
    }, []);

    async function loadAllData() {
        try {
            console.log("🔍 DEBUG: Loading all data from Firestore...");

            // Test 1: Get all workshops
            console.log("\n📍 TEST 1: Fetching workshops collection");
            const workshopsSnap = await getDocs(collection(db, "workshops"));
            console.log(`Found ${workshopsSnap.size} workshops`);

            const workshopsData = workshopsSnap.docs.map((doc) => ({
                id: doc.id,
                path: doc.ref.path,
                ...doc.data(),
            }));
            setWorkshops(workshopsData);

            // Test 2: Get all bookings using collection group
            console.log("\n📍 TEST 2: Fetching ALL bookings using collectionGroup");
            const bookingsSnap = await getDocs(collectionGroup(db, "bookings"));
            console.log(`Found ${bookingsSnap.size} total bookings`);

            const bookingsData = bookingsSnap.docs.map((doc) => {
                const data = doc.data();
                console.log("Booking doc path:", doc.ref.path);
                console.log("Booking data:", data);
                return {
                    id: doc.id,
                    path: doc.ref.path,
                    ...data,
                };
            });
            setBookings(bookingsData);

            // Test 3: Manual path check
            console.log("\n📍 TEST 3: Checking manual paths");
            for (const workshop of workshopsData) {
                const slotsSnap = await getDocs(
                    collection(db, "workshops", workshop.id, "slots")
                );
                console.log(`Workshop ${workshop.id}: ${slotsSnap.size} slots`);

                for (const slotDoc of slotsSnap.docs) {
                    const slotBookingsSnap = await getDocs(
                        collection(db, "workshops", workshop.id, "slots", slotDoc.id, "bookings")
                    );
                    console.log(`  Slot ${slotDoc.id}: ${slotBookingsSnap.size} bookings`);
                }
            }

            setLoading(false);
        } catch (err) {
            console.error("❌ DEBUG ERROR:", err);
            setError(err.message);
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Debug View - Loading...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Debug View - Error</h1>
                <pre className="bg-red-50 p-4 rounded text-red-900">{error}</pre>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">🔍 Firestore Debug View</h1>

            {/* Workshops */}
            <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">Workshops ({workshops.length})</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                    {JSON.stringify(workshops, null, 2)}
                </pre>
            </div>

            {/* Bookings */}
            <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">
                    All Bookings - Collection Group ({bookings.length})
                </h2>
                {bookings.length === 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="font-bold text-yellow-800">⚠️ No bookings found</p>
                        <p className="text-yellow-700 text-sm mt-2">
                            This means registrations are NOT being written to Firestore.
                            Check browser console during registration for errors.
                        </p>
                    </div>
                ) : (
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                        {JSON.stringify(bookings, null, 2)}
                    </pre>
                )}
            </div>

            {/* Raw Paths */}
            <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">Document Paths</h2>
                <ul className="space-y-1 font-mono text-sm">
                    {bookings.map((booking, idx) => (
                        <li key={idx} className="text-blue-600">
                            {booking.path}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
