const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// Production Data from User
const WORKSHOPS = [
    {
        id: "pottery-workshop",
        name: "Pottery Workshop",
        description: "A hands-on session where participants learn basic clay shaping and pottery techniques while exploring the artistic and therapeutic side of working with clay.",
        price: 300,
        date: "March 10, 2026",
        venue: "Arts Block – Studio Hall",
        qrCode: "/images/qr/pottery.png", // Assuming file will be added later
        isActive: true,
        // Time Configuration
        startTime: { hour: 10, minute: 0 },
        endTime: { hour: 13, minute: 0 }
    },
    {
        id: "tie-dye-workshop",
        name: "Tie and Dye Workshop",
        description: "An interactive workshop introducing traditional tie and dye techniques, allowing participants to create unique patterns and understand the craft behind handmade textiles.",
        price: 250,
        date: "March 11, 2026",
        venue: "Design Lab – Textile Room",
        qrCode: "/images/qr/tiedye.png",
        isActive: true,
        // Time Configuration
        startTime: { hour: 11, minute: 0 },
        endTime: { hour: 15, minute: 0 }
    },
    {
        id: "painting-workshop",
        name: "Painting Workshop",
        description: "This workshop features traditional and contemporary art forms including Cheriyal, Kalamkari, tote bag, and plant pot painting, blending cultural heritage with creative expression.",
        price: 350,
        date: "March 12, 2026",
        venue: "Fine Arts Gallery – Room 204",
        qrCode: "/images/qr/painting.png",
        isActive: true,
        // Time Configuration
        startTime: { hour: 9, minute: 30 },
        endTime: { hour: 16, minute: 30 }
    }
];

async function generateSlots(workshopId, config) {
    console.log(`Generating slots for workshop: ${workshopId}`);
    const batch = db.batch();
    const slotsRef = db.collection("workshops").doc(workshopId).collection("slots");

    // Convert start/end to minutes from midnight
    const startMinutes = config.startTime.hour * 60 + config.startTime.minute;
    const endMinutes = config.endTime.hour * 60 + config.endTime.minute;
    const interval = 15; // 15 minutes

    let count = 0;

    // Generate slots until endMinutes
    // Note: If range is 10:00 - 13:00, the last slot should be 12:45 - 01:00
    for (let time = startMinutes; time < endMinutes; time += interval) {
        // Calculate Start Time
        const h = Math.floor(time / 60);
        const m = time % 60;

        // Calculate End Time
        const endTimeVal = time + interval;
        const endH = Math.floor(endTimeVal / 60);
        const endM = endTimeVal % 60;

        const formatTime = (hours, minutes) => {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const h12 = hours % 12 || 12;
            const mStr = minutes.toString().padStart(2, '0');
            return `${h12}:${mStr} ${ampm}`;
        };

        const timeString = `${formatTime(h, m)} - ${formatTime(endH, endM)}`;

        // Slot ID: HHMM (start time)
        // Ensure strictly 4 digits e.g. 0930, 1000
        const slotId = `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;

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
    console.log(`Successfully created ${count} slots for ${workshopId} (${config.startTime.hour}:${config.startTime.minute} - ${config.endTime.hour}:${config.endTime.minute})`);
}

async function main() {
    try {
        console.log("Starting Production Data Seed...");
        for (const workshop of WORKSHOPS) {
            // Prepare workshop doc (exclude internal config if desired, but keeping it is harmless)
            const workshopData = { ...workshop };
            delete workshopData.startTime;
            delete workshopData.endTime;

            // Create Workshop Doc
            await db.collection("workshops").doc(workshop.id).set(workshopData);
            console.log(`Created/Updated workshop: ${workshop.name}`);

            // Create Slots
            await generateSlots(workshop.id, workshop);
        }
        console.log("✅ Seeding Complete!");
    } catch (error) {
        console.error("❌ Error seeding:", error);
    }
}

main();
