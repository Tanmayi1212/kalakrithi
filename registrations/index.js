/**
 * Cloud Functions for Kalakrithi × Arangetra
 * Production-hardened version
 */

const {setGlobalOptions} = require("firebase-functions/v2");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();

// Limit scaling to control costs
setGlobalOptions({maxInstances: 10});

/**
 * TEST CONNECTION
 */
exports.testConnection = onCall(async (request) => {
  return {
    success: true,
    message: "Backend connection successful 🚀",
    authenticated: !!request.auth,
    timestamp: new Date().toISOString(),
  };
});

/**
 * CREATE WORKSHOP BOOKING
 * Enforces:
 * - Authentication required
 * - One booking per workshop per roll number
 * - Max capacity per slot
 * - Transaction safety
 */
exports.createWorkshopBooking = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required");
  }

  const {workshopId, slotId, name, email, phone, rollNumber, paymentId} = request.data;

  if (!workshopId || !slotId || !name || !email || !phone || !rollNumber || !paymentId) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;
  const rollRegex = /^[A-Z0-9]+$/i;

  if (!emailRegex.test(email)) {
    throw new HttpsError("invalid-argument", "Invalid email");
  }

  if (!phoneRegex.test(phone)) {
    throw new HttpsError("invalid-argument", "Phone must be 10 digits");
  }

  if (!rollRegex.test(rollNumber)) {
    throw new HttpsError("invalid-argument", "Invalid roll number");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const workshopRef = db.collection("workshops").doc(workshopId);
      const slotRef = workshopRef.collection("slots").doc(slotId);
      const bookingRef = slotRef.collection("bookings").doc(rollNumber);

      // NEW: Workshop-wide participant ref
      const participantRef = workshopRef
          .collection("participants")
          .doc(rollNumber);

      // Optional: prevent duplicate paymentId usage
      const paymentRef = db.collection("payments").doc(paymentId);

      // 1️⃣ Check workshop
      const workshopDoc = await transaction.get(workshopRef);
      if (!workshopDoc.exists) {
        throw new HttpsError("not-found", "Workshop not found");
      }

      // 2️⃣ Check slot
      const slotDoc = await transaction.get(slotRef);
      if (!slotDoc.exists) {
        throw new HttpsError("not-found", "Slot not found");
      }

      const maxCapacity = slotDoc.data().maxCapacity || 4;

      // 3️⃣ Check workshop-wide duplicate
      const participantDoc = await transaction.get(participantRef);
      if (participantDoc.exists) {
        throw new HttpsError(
            "already-exists",
            "You are already registered for this workshop",
        );
      }

      // 4️⃣ Check payment ID reuse
      const paymentDoc = await transaction.get(paymentRef);
      if (paymentDoc.exists) {
        throw new HttpsError(
            "already-exists",
            "Payment already used",
        );
      }

      // 5️⃣ Check slot duplicate
      const existingBooking = await transaction.get(bookingRef);
      if (existingBooking.exists) {
        throw new HttpsError(
            "already-exists",
            "Already registered in this slot",
        );
      }

      // 6️⃣ Count slot bookings
      const bookingsSnapshot = await transaction.get(
          slotRef.collection("bookings"),
      );

      const currentCount = bookingsSnapshot.size;

      if (currentCount >= maxCapacity) {
        throw new HttpsError(
            "resource-exhausted",
            "Slot is full",
        );
      }

      const now = FieldValue.serverTimestamp();

      // 7️⃣ Create slot booking
      transaction.set(bookingRef, {
        name,
        email,
        phone,
        rollNumber,
        paymentId,
        workshopId,
        slotId,
        createdAt: now,
        userId: request.auth.uid,
        status: "confirmed",
      });

      // 8️⃣ Mark participant at workshop level
      transaction.set(participantRef, {
        rollNumber,
        workshopId,
        slotId,
        registeredAt: now,
        paymentId,
      });

      // 9️⃣ Mark payment as used
      transaction.set(paymentRef, {
        rollNumber,
        workshopId,
        slotId,
        usedAt: now,
      });

      return {
        success: true,
        message: "Workshop booking confirmed",
        remainingSeats: maxCapacity - currentCount - 1,
      };
    });

    return result;
  } catch (error) {
    logger.error("Booking error", {error: error.message});

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError(
        "internal",
        "Booking failed. Try again.",
    );
  }
});


/**
 * REGISTER FOR GAME
 * One registration per rollNumber per game
 */
exports.registerForGame = onCall(async (request) => {
  const {gameId, name, rollNumber, phone} = request.data;

  if (!gameId || !name || !rollNumber || !phone) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }

  const phoneRegex = /^[0-9]{10}$/;
  const rollRegex = /^[A-Z0-9]+$/i;

  if (!phoneRegex.test(phone)) {
    throw new HttpsError("invalid-argument", "Invalid phone");
  }

  if (!rollRegex.test(rollNumber)) {
    throw new HttpsError("invalid-argument", "Invalid roll number");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const gameRef = db.collection("arangetraGames").doc(gameId);
      const registrationRef = gameRef
          .collection("registrations")
          .doc(rollNumber);

      const gameDoc = await transaction.get(gameRef);
      if (!gameDoc.exists) {
        throw new HttpsError("not-found", "Game not found");
      }

      const existing = await transaction.get(registrationRef);
      if (existing.exists) {
        throw new HttpsError(
            "already-exists",
            "Already registered for this game",
        );
      }

      transaction.set(registrationRef, {
        name,
        rollNumber,
        phone,
        gameId,
        createdAt: FieldValue.serverTimestamp(),
        status: "confirmed",
        userId: request.auth ? request.auth.uid : null,
      });

      return {
        success: true,
        message: "Game registration successful",
      };
    });

    return result;
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError(
        "internal",
        "Registration failed",
    );
  }
});
