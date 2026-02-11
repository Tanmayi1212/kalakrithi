/**
 * React Hooks for Firebase Cloud Functions
 * 
 * This file provides React hooks for:
 * - Fetching workshops and slots with real-time updates
 * - Calling Cloud Functions
 * - Managing loading and error states
 */

import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, auth } from '../firebase';

/**
 * Hook to test backend connection
 * 
 * @returns {Function} Function to test connection
 */
export function useTestConnection() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const testConnection = async () => {
        setLoading(true);
        setError(null);

        try {
            const testConnectionFn = httpsCallable(functions, 'testConnection');
            const response = await testConnectionFn();
            setResult(response.data);
            return response.data;
        } catch (err) {
            console.error('Connection test failed:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { testConnection, loading, result, error };
}

/**
 * Hook to fetch workshops with real-time updates
 * 
 * @returns {Object} { workshops: Array, loading: boolean, error: Error }
 */
export function useWorkshops() {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const workshopsRef = collection(db, 'workshops');

        // Subscribe to real-time updates
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

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { workshops, loading, error };
}

/**
 * Hook to fetch slots for a specific workshop with real-time updates
 * Automatically calculates current bookings and remaining seats
 * 
 * @param {string} workshopId - The workshop ID
 * @returns {Object} { slots: Array, loading: boolean, error: Error, refetch: Function }
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

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(
            slotsRef,
            async (snapshot) => {
                // For each slot, count bookings and calculate availability
                const slotsWithBookings = await Promise.all(
                    snapshot.docs.map(async (slotDoc) => {
                        const slotData = slotDoc.data();

                        // Get booking count for this slot
                        const bookingsRef = collection(
                            db,
                            `workshops/${workshopId}/slots/${slotDoc.id}/bookings`
                        );
                        const bookingsSnapshot = await getDocs(bookingsRef);
                        const bookingCount = bookingsSnapshot.size;

                        const maxCapacity = slotData.maxCapacity || 4;

                        return {
                            id: slotDoc.id,
                            ...slotData,
                            bookingCount,
                            maxCapacity,
                            remainingSeats: maxCapacity - bookingCount,
                            isFull: bookingCount >= maxCapacity,
                            availabilityPercentage: ((maxCapacity - bookingCount) / maxCapacity) * 100
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

    // Provide manual refetch function if needed
    const refetch = () => {
        setLoading(true);
    };

    return { slots, loading, error, refetch };
}

/**
 * Hook to fetch Arangetra games with real-time updates
 * 
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
 * Function to create workshop booking
 * 
 * REQUIRES USER TO BE AUTHENTICATED
 * 
 * @param {Object} bookingData - { workshopId, slotId, name, email, phone, rollNumber, paymentId }
 * @returns {Promise} Result from Cloud Function
 */
export async function createWorkshopBooking(bookingData) {
    try {
        // Check if user is authenticated
        if (!auth.currentUser) {
            throw new Error('You must be signed in to book a workshop');
        }

        const createBooking = httpsCallable(functions, 'createWorkshopBooking');
        const result = await createBooking(bookingData);

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error creating workshop booking:', error);

        // Extract meaningful error message
        let errorMessage = 'Failed to create booking. Please try again.';

        if (error.code === 'unauthenticated') {
            errorMessage = 'Please sign in to book a workshop';
        } else if (error.code === 'resource-exhausted') {
            errorMessage = error.message || 'This slot is full';
        } else if (error.code === 'already-exists') {
            errorMessage = error.message || 'You have already registered for this workshop';
        } else if (error.code === 'not-found') {
            errorMessage = error.message || 'Workshop or slot not found';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Function to register for Arangetra game
 * 
 * @param {Object} registrationData - { gameId, name, rollNumber, phone }
 * @returns {Promise} Result from Cloud Function
 */
export async function registerForGame(registrationData) {
    try {
        const registerGame = httpsCallable(functions, 'registerForGame');
        const result = await registerGame(registrationData);

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error registering for game:', error);

        // Extract meaningful error message
        let errorMessage = 'Failed to register. Please try again.';

        if (error.code === 'already-exists') {
            errorMessage = error.message || 'You have already registered for this game';
        } else if (error.code === 'not-found') {
            errorMessage = error.message || 'Game not found';
        } else if (error.code === 'invalid-argument') {
            errorMessage = error.message || 'Please check your details and try again';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Hook to check if user is authenticated
 * 
 * @returns {Object} { user: User | null, loading: boolean }
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
