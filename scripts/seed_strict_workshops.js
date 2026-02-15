const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

const serviceAccount = require("./service-account.json");

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = getFirestore();

// ------------------------------------------------------------------
// DATA DEFINITION - STRICT SCHEDULE
// ------------------------------------------------------------------

const SCHEDULE = [
    {
        day: "Day 1",
        date: "2026-02-17", // Tuesday
        // Day 1: 11:00 AM – 4:00 PM (16:00)
        // Lunch: 12:30 PM – 1:30 PM (13:30)
        workshops: [
            {
                id: "pottery_day1",
                name: "Pottery",
                description: "Experience the art of pottery making on the wheel. (Per Duo)",
                price: 150, // Per Duo
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4, // 4 wheels = 4 duos (since booking is per duo)
                startTime: "11:00",
                endTime: "16:00",
                lunchStart: "12:30",
                lunchEnd: "13:30"
            },
            {
                id: "cheriyal_day1",
                name: "Cheriyal", // "Cheriyal" in prompt
                description: "Traditional Telangana art form. (Per Duo)",
                price: 150, // Per Duo
                type: "duo", // "Multiple duos per slot allowed"
                slotDuration: 30,
                // "Total slots: 14" -> 2 parallel * 7 intervals?
                // Let's assume high capacity like 12 duos per slot to allow multiple.
                maxCapacity: 10,
                startTime: "11:30", // Explicit start
                endTime: "16:00",
                lunchStart: "12:30",
                lunchEnd: "13:30"
            }
        ]
    },
    {
        day: "Day 2",
        date: "2026-02-18", // Wednesday
        // Day 2: 9:30 AM – 4:00 PM (16:00)
        // Lunch: 12:30 PM – 1:30 PM (13:30)
        workshops: [
            {
                id: "pottery_day2",
                name: "Pottery",
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4,
                startTime: "09:30",
                endTime: "16:00",
                lunchStart: "12:30",
                lunchEnd: "13:30"
            },
            {
                id: "cheriyal_day2",
                name: "Cheriyal",
                price: 150,
                type: "duo",
                slotDuration: 30,
                maxCapacity: 10,
                startTime: "09:30",
                endTime: "16:00",
                lunchStart: "12:30",
                lunchEnd: "13:30"
            },
            {
                id: "tiedye_day2",
                name: "Tie & Dye",
                price: 200,
                type: "duo",
                slotDuration: 20, // 15 activity + 5 buffer
                maxCapacity: 5,
                startTime: "09:30",
                endTime: "16:00",
                lunchStart: "12:30",
                lunchEnd: "13:30"
            }
        ]
    },
    {
        day: "Day 3",
        date: "2026-02-19", // Thursday
        // Day 3: 11:00 AM – 4:00 PM
        // Lunch assumed same: 12:30-1:30 (Standard separator)
        workshops: [
            {
                id: "pottery_day3",
                name: "Pottery",
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4,
                startTime: "11:00",
                endTime: "16:00",
                lunchStart: "12:30",
                lunchEnd: "13:30"
            },
            {
                id: "tiedye_day3",
                name: "Tie & Dye",
                price: 200,
                type: "duo",
                slotDuration: 20,
                maxCapacity: 5,
                startTime: "11:00",
                endTime: "16:00",
                lunchStart: "12:30",
                lunchEnd: "13:30"
            },
            {
                id: "cheriyal_day3",
                name: "Cheriyal",
                price: 150,
                type: "duo",
                slotDuration: 30,
                maxCapacity: 10,
                startTime: "11:00",
                endTime: "16:00",
                lunchStart: "12:30",
                lunchEnd: "13:30"
            }
        ]
    },
    {
        day: "Day 4",
        date: "2026-02-20", // Friday
        // Day 4: 9:30 AM – 3:00 PM
        // Pottery & Cheriyal: 9:30 - 12:00
        // Tholubommalata: 12:00 - 3:00
        workshops: [
            {
                id: "pottery_day4",
                name: "Pottery",
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4,
                startTime: "09:30",
                endTime: "12:00",
                lunchStart: null, // No lunch in this short block
                lunchEnd: null
            },
            {
                id: "cheriyal_day4",
                name: "Cheriyal",
                price: 150,
                type: "duo",
                slotDuration: 30,
                maxCapacity: 10,
                startTime: "09:30",
                endTime: "12:00",
                lunchStart: null,
                lunchEnd: null
            },
            {
                id: "tholu_day4",
                name: "Tholubommalata",
                price: 69, // Per Duo
                type: "duo",
                slotDuration: 180, // 3 hours (12-3) = 180 mins
                maxCapacity: 400, // "400 duo bookings allowed"
                startTime: "12:00",
                endTime: "15:00",
                lunchStart: null,
                lunchEnd: null,
                singleSlot: true // Logic flag for single session
            }
        ]
    }
];

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

function parseTime(timeStr, dateStr) {
    // timeStr: "HH:MM", dateStr: "YYYY-MM-DD"
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function formatTimeAMPM(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function generateSlots(ws, dayDate) {
    // Single massive slot (Tholubommalata)
    if (ws.singleSlot) {
        const start = parseTime(ws.startTime, dayDate);
        const end = parseTime(ws.endTime, dayDate);
        return [{
            id: `slot_${ws.startTime.replace(":", "")}_TO_${ws.endTime.replace(":", "")}`,
            time: `${formatTimeAMPM(start)} - ${formatTimeAMPM(end)}`,
            maxCapacity: ws.maxCapacity,
            currentBookings: 0,
            remainingSeats: ws.maxCapacity, // Starts full
            isClosed: false,
            price: ws.price, // Storing price on slot as well just in case
            createdAt: Timestamp.now()
        }];
    }

    const slots = [];
    const start = parseTime(ws.startTime, dayDate);
    const end = parseTime(ws.endTime, dayDate);

    // Lunch times
    let lunchS = null;
    let lunchE = null;
    if (ws.lunchStart && ws.lunchEnd) {
        lunchS = parseTime(ws.lunchStart, dayDate);
        lunchE = parseTime(ws.lunchEnd, dayDate);
    }

    let current = new Date(start);

    while (current < end) {
        // Calculate potential end of this slot
        const nextTime = new Date(current.getTime() + ws.slotDuration * 60000);

        // 1. Strict Stop: If slot ends AFTER event end time, DO NOT create it.
        // Prompt says "Stop before 4:00 PM"
        if (nextTime > end) break;

        // 2. Strict Lunch: Skip if overlaps lunch
        let isLunch = false;
        if (lunchS && lunchE) {
            // Overlap logic: (Start < LunchEnd) && (End > LunchStart)
            // e.g. Slot 12:15-12:30 (End 12:30 == LunchStart, OK)
            // Slot 12:30-12:45 (Start 12:30 == LunchStart, BAD? "Skip lunch break")
            // Usually lunch starts AT 12:30. So 12:30 slot should be skipped.

            // If slot starts AT or AFTER LunchStart AND starts BEFORE LunchEnd -> In Lunch
            if (current >= lunchS && current < lunchE) isLunch = true;

            // If slot starts BEFORE LunchStart BUT ends AFTER LunchStart -> Overlaps into lunch
            // e.g. 12:20 - 12:40 (Tie Dye) -> Overlaps 12:30.
            if (current < lunchS && nextTime > lunchS) isLunch = true;
        }

        if (!isLunch) {
            const timeLabel = formatTimeAMPM(current);
            // Unique ID based on time
            const slotId = `slot_${current.getHours()}_${current.getMinutes()}`;

            slots.push({
                id: slotId,
                time: timeLabel,
                maxCapacity: ws.maxCapacity,
                currentBookings: 0,
                remainingSeats: ws.maxCapacity,
                isClosed: false,
                price: ws.price,
                createdAt: Timestamp.now()
            });
        }

        // Advance time
        current = nextTime;
    }

    return slots;
}

// ------------------------------------------------------------------
// MAIN
// ------------------------------------------------------------------

async function seed() {
    console.log("🚀 Starting STRICT Seed Process...");

    try {
        // 1. Delete existing workshops AND their slots (Subcollections must be deleted manually in Admin SDK sans recursiveDelete)
        console.log("Fetching old workshops to delete...");

        const snapshot = await db.collection("workshops").get();
        if (!snapshot.empty) {
            console.log(`Found ${snapshot.size} workshops. Deleting them and their slots...`);

            for (const doc of snapshot.docs) {
                // Delete subcollection 'slots'
                const slotsSnapshot = await doc.ref.collection("slots").get();
                if (!slotsSnapshot.empty) {
                    const slotBatch = db.batch();
                    slotsSnapshot.docs.forEach(slotDoc => slotBatch.delete(slotDoc.ref));
                    await slotBatch.commit();
                    console.log(`   -> Deleted ${slotsSnapshot.size} old slots for ${doc.id}`);
                }

                // Delete parent doc
                await doc.ref.delete();
            }
            console.log("✅ Old data cleared.");
        } else {
            console.log("No existing workshops found.");
        }

        // Create new
        const batch = db.batch();

        for (const day of SCHEDULE) {
            console.log(`Processing ${day.day} (${day.date})...`);

            for (const ws of day.workshops) {
                // Document Reference
                const workshopRef = db.collection("workshops").doc(ws.id);

                // Workshop Metadata
                const workshopData = {
                    name: ws.name,
                    description: ws.description || `${ws.name} Workshop (${ws.slotDuration} mins)`,
                    price: ws.price, // STRICT: Per Duo Price
                    day: day.day,
                    date: day.date,
                    startTime: ws.startTime,
                    endTime: ws.endTime,
                    venue: "CBIT Campus", // Default
                    isActive: true,
                    type: ws.type, // 'duo'
                    qrCode: "/qr/payment-qr.svg", // Placeholder
                    createdAt: Timestamp.now()
                };

                batch.set(workshopRef, workshopData);
                console.log(`  -> Queued Workshop: ${ws.name}`);

                // Generate Slots
                const slots = generateSlots(ws, day.date);
                console.log(`     -> Generated ${slots.length} slots.`);

                // Add slots to subcollection (Requires separate operations, cannot batch subcollections set easily in one go efficiently without loops)
                // We will commit the workshop doc first or just use Promises for slots.
                // Let's commit the current batch of workshops later? 
                // Actually, let's write slots immediately to avoid huge batch issues.
            }
        }

        await batch.commit();
        console.log("✅ Main Workshop Documents Created.");

        // Now write slots (Subcollections)
        // We do this separately to ensure parent docs exist (though not strictly required in Firestore)
        // and to manage batch sizes if needed.
        console.log("Writing slots...");

        for (const day of SCHEDULE) {
            for (const ws of day.workshops) {
                const slots = generateSlots(ws, day.date);
                const workshopRef = db.collection("workshops").doc(ws.id);

                // Batch per workshop to be safe
                const slotBatch = db.batch();

                for (const slot of slots) {
                    const slotRef = workshopRef.collection("slots").doc(slot.id);
                    slotBatch.set(slotRef, slot);
                }

                await slotBatch.commit();
                console.log(`  -> Wrote slots for ${ws.id}`);
            }
        }

        console.log("✅ STRICT SEEDING COMPLETE!");

    } catch (error) {
        console.error("❌ Seed Failed:", error);
    }
}

seed();
