// React Hooks for Firebase Operations
import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

/**
 * Hook to fetch workshops with real-time updates
 * @returns {Object} { workshops: Array, loading: boolean, error: Error }
 */
export function useWorkshops() {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const workshopsRef = collection(db, 'workshops');

        const unsubscribe = onSnapshot(
            workshopsRef,
            (snapshot) => {
                const workshopsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setWorkshops(workshopsData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching workshops:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { workshops, loading, error };
}

/**
 * Hook to fetch slots for a specific workshop with real-time updates
 * @param {string} workshopId - The workshop ID
 * @returns {Object} { slots: Array, loading: boolean, error: Error }
 */
export function useWorkshopSlots(workshopId) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!workshopId) {
            setSlots([]);
            setLoading(false);
            return;
        }

        const slotsRef = collection(db, `workshops/${workshopId}/slots`);

        const unsubscribe = onSnapshot(
            slotsRef,
            async (snapshot) => {
                const slotsWithBookings = await Promise.all(
                    snapshot.docs.map(async (slotDoc) => {
                        // Get booking count for this slot
                        const bookingsRef = collection(db, `workshops/${workshopId}/slots/${slotDoc.id}/bookings`);
                        const bookingsSnapshot = await getDocs(bookingsRef);
                        const bookingCount = bookingsSnapshot.size;

                        return {
                            id: slotDoc.id,
                            ...slotDoc.data(),
                            bookingCount,
                            remainingSeats: (slotDoc.data().maxCapacity || 4) - bookingCount,
                            isFull: bookingCount >= (slotDoc.data().maxCapacity || 4)
                        };
                    })
                );

                setSlots(slotsWithBookings);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching slots:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [workshopId]);

    return { slots, loading, error };
}

/**
 * Hook to fetch games for Arangetra
 * @returns {Object} { games: Array, loading: boolean, error: Error }
 */
export function useArangetraGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const gamesRef = collection(db, 'arangetraGames');

        const unsubscribe = onSnapshot(
            gamesRef,
            (snapshot) => {
                const gamesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setGames(gamesData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching games:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { games, loading, error };
}

/**
 * Function to validate and create workshop booking order
 * @param {Object} bookingData - Booking information
 * @returns {Promise} Result from Cloud Function
 */
export async function createWorkshopBookingOrder(bookingData) {
    const createOrder = httpsCallable(functions, 'createWorkshopBookingOrder');

    try {
        const result = await createOrder(bookingData);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error creating booking order:', error);
        return {
            success: false,
            error: error.message || 'Failed to create booking order'
        };
    }
}

/**
 * Function to verify payment and complete workshop booking
 * @param {Object} paymentData - Payment verification data
 * @returns {Promise} Result from Cloud Function
 */
export async function verifyWorkshopPayment(paymentData) {
    const verifyPayment = httpsCallable(functions, 'verifyWorkshopPayment');

    try {
        const result = await verifyPayment(paymentData);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error verifying payment:', error);
        return {
            success: false,
            error: error.message || 'Payment verification failed'
        };
    }
}

/**
 * Function to register for Arangetra game
 * @param {Object} registrationData - Game registration data
 * @returns {Promise} Result from Cloud Function
 */
export async function registerForGame(registrationData) {
    const registerGame = httpsCallable(functions, 'registerArangetraGame');

    try {
        const result = await registerGame(registrationData);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error registering for game:', error);
        return {
            success: false,
            error: error.message || 'Game registration failed'
        };
    }
}
