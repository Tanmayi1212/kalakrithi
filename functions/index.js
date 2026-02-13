const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { workshopRegistrationEmail, gameRegistrationEmail } = require('./emails/templates');
const { sendEmailWithRetry } = require('./emails/sender');

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function: Register for Workshop
 * Direct registration without payment
 */
exports.registerWorkshop = functions.https.onCall(async (data, context) => {
    try {
        const { workshopId, name, email, rollNumber, phone, college } = data;

        // Validate required fields
        if (!workshopId || !name || !email || !rollNumber || !phone || !college) {
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

        // Use transaction to ensure data consistency
        const result = await db.runTransaction(async (transaction) => {
            const workshopRef = db.collection('workshops').doc(workshopId);
            const workshopDoc = await transaction.get(workshopRef);

            if (!workshopDoc.exists) {
                throw new functions.https.HttpsError(
                    'not-found',
                    'Workshop not found'
                );
            }

            const workshopData = workshopDoc.data();

            // Check if student already registered using rollNumber as doc ID
            const registrationRef = workshopRef.collection('registrations').doc(rollNumber);
            const existingRegistration = await transaction.get(registrationRef);

            if (existingRegistration.exists) {
                throw new functions.https.HttpsError(
                    'already-exists',
                    'You have already registered for this workshop'
                );
            }

            // Check available slots
            const registrationsSnapshot = await transaction.get(
                workshopRef.collection('registrations')
            );

            const maxSlots = workshopData.slots || 30;
            if (registrationsSnapshot.size >= maxSlots) {
                throw new functions.https.HttpsError(
                    'resource-exhausted',
                    'This workshop is full. No slots available.'
                );
            }

            // Create registration
            const registrationData = {
                name,
                email,
                rollNumber,
                phone,
                college,
                workshopId,
                workshopName: workshopData.title,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            transaction.set(registrationRef, registrationData);

            return {
                success: true,
                registrationId: rollNumber,
                workshopName: workshopData.title,
                message: `Successfully registered for ${workshopData.title}!`
            };
        });

        return result;

    } catch (error) {
        console.error('Error in registerWorkshop:', error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            'internal',
            'Workshop registration failed',
            error.message
        );
    }
});

/**
 * Cloud Function: Register for Game
 * Direct registration without payment
 */
exports.registerGame = functions.https.onCall(async (data, context) => {
    try {
        const { gameId, teamName, captainName, email, rollNumber, phone, college, teamMembers } = data;

        // Validate required fields
        if (!gameId || !teamName || !captainName || !email || !rollNumber || !phone || !college) {
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

        // Use transaction for consistency
        const result = await db.runTransaction(async (transaction) => {
            const gameRef = db.collection('arangetraGames').doc(gameId);
            const gameDoc = await transaction.get(gameRef);

            if (!gameDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Game not found');
            }

            const gameData = gameDoc.data();

            // Check if team captain already registered for this game using rollNumber as doc ID
            const registrationRef = gameRef.collection('registrations').doc(rollNumber);
            const existingRegistration = await transaction.get(registrationRef);

            if (existingRegistration.exists) {
                throw new functions.https.HttpsError(
                    'already-exists',
                    'You have already registered for this game'
                );
            }

            // Check available slots
            const registrationsSnapshot = await transaction.get(
                gameRef.collection('registrations')
            );

            const maxSlots = gameData.slots || 20;
            if (registrationsSnapshot.size >= maxSlots) {
                throw new functions.https.HttpsError(
                    'resource-exhausted',
                    'This game is full. No slots available.'
                );
            }

            // Create registration
            const registrationData = {
                teamName,
                captainName,
                email,
                rollNumber,
                phone,
                college,
                teamMembers: teamMembers || '',
                gameId,
                gameName: gameData.title,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            transaction.set(registrationRef, registrationData);

            return {
                success: true,
                registrationId: rollNumber,
                gameName: gameData.title,
                message: `Successfully registered team "${teamName}" for ${gameData.title}!`
            };
        });

        return result;

    } catch (error) {
        console.error('Error in registerGame:', error);

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

/**
 * Firestore Trigger: Send email when workshop registration is created
 */
exports.onWorkshopRegistration = functions.firestore
    .document('workshops/{workshopId}/registrations/{rollNumber}')
    .onCreate(async (snapshot, context) => {
        try {
            const registrationData = snapshot.data();
            const { name, email, rollNumber, college, phone, workshopName } = registrationData;

            // Format registration date
            const registrationDate = registrationData.createdAt
                ? registrationData.createdAt.toDate().toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                    timeZone: 'Asia/Kolkata'
                })
                : new Date().toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                    timeZone: 'Asia/Kolkata'
                });

            // Generate email content
            const emailContent = workshopRegistrationEmail({
                name,
                email,
                workshopName,
                rollNumber,
                college,
                phone,
                registrationDate
            });

            // Send email with retry
            await sendEmailWithRetry({
                to: email,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text
            });

            console.log(`Workshop registration confirmation email sent to ${email}`);
            return { success: true };

        } catch (error) {
            console.error('Error sending workshop confirmation email:', error);
            // Don't throw error - we don't want to fail the registration if email fails
            return { success: false, error: error.message };
        }
    });

/**
 * Firestore Trigger: Send email when game registration is created
 */
exports.onGameRegistration = functions.firestore
    .document('arangetraGames/{gameId}/registrations/{rollNumber}')
    .onCreate(async (snapshot, context) => {
        try {
            const registrationData = snapshot.data();
            const { teamName, captainName, email, rollNumber, college, phone, teamMembers, gameName } = registrationData;

            // Format registration date
            const registrationDate = registrationData.createdAt
                ? registrationData.createdAt.toDate().toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                    timeZone: 'Asia/Kolkata'
                })
                : new Date().toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                    timeZone: 'Asia/Kolkata'
                });

            // Generate email content
            const emailContent = gameRegistrationEmail({
                teamName,
                captainName,
                email,
                gameName,
                rollNumber,
                college,
                phone,
                teamMembers,
                registrationDate
            });

            // Send email with retry
            await sendEmailWithRetry({
                to: email,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text
            });

            console.log(`Game registration confirmation email sent to ${email}`);
            return { success: true };

        } catch (error) {
            console.error('Error sending game confirmation email:', error);
            // Don't throw error - we don't want to fail the registration if email fails
            return { success: false, error: error.message };
        }
    });
