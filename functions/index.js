const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function: Create Workshop Booking Order
 * 
 * Validates workshop booking request and checks capacity before payment
 * 
 * @param {Object} data - { workshopId, slotId, name, email, rollNumber, phone }
 * @returns {Object} { success: boolean, orderId?: string, error?: string }
 */
exports.createWorkshopBookingOrder = functions.https.onCall(async (data, context) => {
    try {
        const { workshopId, slotId, name, email, rollNumber, phone } = data;

        // Validate required fields
        if (!workshopId || !slotId || !name || !email || !rollNumber || !phone) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing required fields'
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid email format'
            );
        }

        // Validate roll number format (adjust regex as needed)
        const rollNumberRegex = /^[A-Z0-9]+$/i;
        if (!rollNumberRegex.test(rollNumber)) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid roll number format'
            );
        }

        // Use transaction to ensure data consistency
        const result = await db.runTransaction(async (transaction) => {
            // Check if workshop exists
            const workshopRef = db.collection('workshops').doc(workshopId);
            const workshopDoc = await transaction.get(workshopRef);

            if (!workshopDoc.exists) {
                throw new functions.https.HttpsError(
                    'not-found',
                    'Workshop not found'
                );
            }

            const workshopData = workshopDoc.data();

            // Check if slot exists
            const slotRef = workshopRef.collection('slots').doc(slotId);
            const slotDoc = await transaction.get(slotRef);

            if (!slotDoc.exists) {
                throw new functions.https.HttpsError(
                    'not-found',
                    'Slot not found'
                );
            }

            const slotData = slotDoc.data();
            const maxCapacity = slotData.maxCapacity || 4;

            // Check if student already has a booking for THIS workshop (any slot)
            const allSlotsSnapshot = await transaction.get(
                workshopRef.collection('slots')
            );

            for (const slotDocSnap of allSlotsSnapshot.docs) {
                const existingBookingRef = slotDocSnap.ref
                    .collection('bookings')
                    .doc(rollNumber);
                const existingBooking = await transaction.get(existingBookingRef);

                if (existingBooking.exists) {
                    throw new functions.https.HttpsError(
                        'already-exists',
                        `You have already registered for this workshop in slot: ${slotDocSnap.data().time}`
                    );
                }
            }

            // Check slot capacity
            const bookingsSnapshot = await transaction.get(
                slotRef.collection('bookings')
            );

            if (bookingsSnapshot.size >= maxCapacity) {
                throw new functions.https.HttpsError(
                    'resource-exhausted',
                    'This slot is already full. Please select another slot.'
                );
            }

            // Create temporary order ID
            const orderId = `ORDER_${workshopId}_${slotId}_${rollNumber}_${Date.now()}`;

            return {
                success: true,
                orderId,
                workshopName: workshopData.name,
                slotTime: slotData.time,
                price: workshopData.price,
                remainingSeats: maxCapacity - bookingsSnapshot.size - 1
            };
        });

        return result;

    } catch (error) {
        console.error('Error in createWorkshopBookingOrder:', error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            'internal',
            'Failed to create booking order',
            error.message
        );
    }
});

/**
 * Cloud Function: Verify Workshop Payment
 * 
 * Verifies payment and creates the booking record with transaction safety
 * 
 * @param {Object} data - { workshopId, slotId, name, email, rollNumber, phone, paymentId }
 * @returns {Object} { success: boolean, bookingId?: string, error?: string }
 */
exports.verifyWorkshopPayment = functions.https.onCall(async (data, context) => {
    try {
        const { workshopId, slotId, name, email, rollNumber, phone, paymentId } = data;

        // Validate required fields
        if (!workshopId || !slotId || !name || !email || !rollNumber || !phone || !paymentId) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing required fields'
            );
        }

        // Use transaction to ensure atomicity
        const result = await db.runTransaction(async (transaction) => {
            const workshopRef = db.collection('workshops').doc(workshopId);
            const slotRef = workshopRef.collection('slots').doc(slotId);
            const bookingRef = slotRef.collection('bookings').doc(rollNumber);

            // Check if workshop exists
            const workshopDoc = await transaction.get(workshopRef);
            if (!workshopDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Workshop not found');
            }

            // Check if slot exists
            const slotDoc = await transaction.get(slotRef);
            if (!slotDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Slot not found');
            }

            const slotData = slotDoc.data();
            const maxCapacity = slotData.maxCapacity || 4;

            // Check if already booked
            const existingBooking = await transaction.get(bookingRef);
            if (existingBooking.exists) {
                throw new functions.https.HttpsError(
                    'already-exists',
                    'You have already booked this slot'
                );
            }

            // Re-check capacity (double safety)
            const bookingsSnapshot = await transaction.get(slotRef.collection('bookings'));
            if (bookingsSnapshot.size >= maxCapacity) {
                throw new functions.https.HttpsError(
                    'resource-exhausted',
                    'Slot became full during payment. Please contact support for refund.'
                );
            }

            // TODO: Add actual payment verification logic here
            // For now, we assume paymentId is valid
            // In production, integrate with payment gateway API

            // Create the booking
            const bookingData = {
                name,
                email,
                rollNumber,
                phone,
                paymentId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                workshopId,
                slotId,
                slotTime: slotData.time,
                workshopName: workshopDoc.data().name
            };

            transaction.set(bookingRef, bookingData);

            return {
                success: true,
                bookingId: rollNumber,
                message: 'Booking confirmed successfully!'
            };
        });

        return result;

    } catch (error) {
        console.error('Error in verifyWorkshopPayment:', error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            'internal',
            'Payment verification failed',
            error.message
        );
    }
});

/**
 * Cloud Function: Register for Arangetra Game
 * 
 * Registers a student for a free Arangetra game
 * 
 * @param {Object} data - { gameId, name, rollNumber, phone }
 * @returns {Object} { success: boolean, registrationId?: string, error?: string }
 */
exports.registerArangetraGame = functions.https.onCall(async (data, context) => {
    try {
        const { gameId, name, rollNumber, phone } = data;

        // Validate required fields
        if (!gameId || !name || !rollNumber || !phone) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing required fields'
            );
        }

        // Validate roll number format
        const rollNumberRegex = /^[A-Z0-9]+$/i;
        if (!rollNumberRegex.test(rollNumber)) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid roll number format'
            );
        }

        // Validate phone number (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Phone number must be 10 digits'
            );
        }

        // Use transaction for consistency
        const result = await db.runTransaction(async (transaction) => {
            const gameRef = db.collection('arangetraGames').doc(gameId);
            const gameDoc = await transaction.get(gameRef);

            if (!gameDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Game not found');
            }

            const gameData = gameDoc.data();

            // Check if student already registered for this game using rollNumber as doc ID
            const registrationRef = gameRef.collection('registrations').doc(rollNumber);
            const existingRegistration = await transaction.get(registrationRef);

            if (existingRegistration.exists) {
                throw new functions.https.HttpsError(
                    'already-exists',
                    'You have already registered for this game'
                );
            }

            // Create registration
            const registrationData = {
                name,
                rollNumber,
                phone,
                gameId,
                gameName: gameData.name,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            transaction.set(registrationRef, registrationData);

            return {
                success: true,
                registrationId: rollNumber,
                message: `Successfully registered for ${gameData.name}!`
            };
        });

        return result;

    } catch (error) {
        console.error('Error in registerArangetraGame:', error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            'internal',
            'Game registration failed',
            error.message
        );
    }
});
