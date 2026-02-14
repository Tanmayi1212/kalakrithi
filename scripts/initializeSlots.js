const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../../kalakrithi-personal-firebase-adminsdk-fbsvc-2ee16e1ec6.json'); // Adjust path as needed

// Initialize Firebase Admin
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const WORKSHOPS = [
    {
        id: "pottery-basics",
        name: "Pottery Basics",
        description: "Learn the art of pottery making from scratch.",
        price: 499,
        isActive: true
    },
    // Add other workshops if needed
];

async function generateSlots(workshopId) {
    console.log(`Generating slots for workshop: ${workshopId}`);
    const batch = db.batch();
    const slotsRef = db.collection("workshops").doc(workshopId).collection("slots");

    const startTime = 10 * 60; // 10:00 AM in minutes
    const endTime = 17 * 60;   // 5:00 PM in minutes
    const interval = 15;       // 15 minutes

    let count = 0;
    for (let time = startTime; time < endTime; time += interval) {
        const h = Math.floor(time / 60);
        const m = time % 60;

        const endH = Math.floor((time + interval) / 60);
        const endM = (time + interval) % 60;

        const formatTime = (hours, minutes) => {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const h12 = hours % 12 || 12;
            const mStr = minutes.toString().padStart(2, '0');
            return `${h12}:${mStr} ${ampm}`;
        };

        const timeString = `${formatTime(h, m)} - ${formatTime(endH, endM)}`;
        const slotId = `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`; // e.g. 1000, 1015

        const docRef = slotsRef.doc(slotId);
        batch.set(docRef, {
            time: timeString,
            maxCapacity: 4,
            isClosed: false,
            currentBookings: 0
        });
        count++;
    }

    await batch.commit();
    console.log(`Successfully created ${count} slots for ${workshopId}`);
}

async function main() {
    try {
        for (const workshop of WORKSHOPS) {
            // Create Workshop Doc
            await db.collection("workshops").doc(workshop.id).set(workshop);
            console.log(`Created workshop: ${workshop.name}`);

            // Create Slots
            await generateSlots(workshop.id);
        }
        console.log("Initialization Complete!");
    } catch (error) {
        console.error("Error initializing:", error);
    }
}

main();
