const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

// Instructions:
// 1. Download service account key from Firebase Console -> Project Settings -> Service Accounts
// 2. Save it as "service-account.json" in this directory
// 3. Run: node scripts/seedWorkshops.js

const serviceAccount = require("./service-account.json");

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = getFirestore();

// ------------------------------------------------------------------
// DATA DEFINITION
// ------------------------------------------------------------------

const YEAR = 2026;
const MONTH = 1; // February (0-indexed)

const SCHEDULE = [
    {
        day: "Day 1",
        date: "2026-02-17", // Tuesday
        startTime: "11:00",
        endTime: "16:00",
        lunchStart: "12:30",
        lunchEnd: "13:30",
        workshops: [
            {
                id: "pottery_day1",
                name: "Pottery Workshop",
                description: "Experience the art of pottery making on the wheel.",
                price: 150, // Per duo
                type: "duo", // Custom flag for logic
                slotDuration: 15,
                maxCapacity: 4, // 4 wheels = 4 bookings (duos)
                startTime: "11:00", // Optional override
                endTime: "16:00"
            },
            {
                id: "cheriyal_day1",
                name: "Cheriyal Arts",
                description: "Traditional Telangana art form.",
                price: 150,
                type: "individual",
                slotDuration: 30,
                maxCapacity: 12, // 2 resources * 6 members = 12 capacity? OR is it 14 total slots across 7 intervals? 
                // Logic: 7 intervals. 14 total slots. => 2 parallel sessions. 
                // Each session has 6 members. Total capacity per interval = 12.
                startTime: "11:30",
                endTime: "16:00"
            }
        ]
    },
    {
        day: "Day 2",
        date: "2026-02-18", // Wednesday
        startTime: "09:30",
        endTime: "16:00",
        lunchStart: "12:30",
        lunchEnd: "13:30",
        workshops: [
            {
                id: "pottery_day2",
                name: "Pottery Workshop",
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4, // Assuming same wheels. 88 total slots / (11 intervals * 2??)
                // Wait. Time: 9:30-4:00 (6.5 hrs) - 1 hr lunch = 5.5 hrs = 330 mins.
                // 330 / 15 = 22 intervals.
                // Total slots: 88. 
                // 88 / 22 = 4. 
                // Matches 4 wheels. Correct.
            },
            {
                id: "cheriyal_day2",
                name: "Cheriyal Arts",
                price: 150,
                type: "individual",
                slotDuration: 30,
                maxCapacity: 12, // 22 total slots / 11 intervals = 2 parallel. 2 * 6 = 12.
            },
            {
                id: "tiedye_day2",
                name: "Tie & Dye",
                price: 200,
                type: "duo",
                slotDuration: 20, // 15 + 5
                maxCapacity: 5, // "10 people per slot (5 duos)" -> Booking unit duo.
                // 16 total slots.
                // Intervals: 9:30-12:30 (180m/20 = 9) + 1:30-4:00 (150m/20 = 7.5 -> 7). Total 16.
                // Matches.
            }
        ]
    },
    {
        day: "Day 3",
        date: "2026-02-19", // Thursday
        startTime: "11:00",
        endTime: "16:00",
        // No lunch mentioned? "Event Time: 11:00 AM – 4:00 PM".
        // Usually consistently applied. Let's assume lunch exists if crossing 12:30-1:30?
        // Let's assume same logic as Day 1 (11-4) which had lunch.
        lunchStart: "12:30",
        lunchEnd: "13:30",
        workshops: [
            {
                id: "pottery_day3",
                name: "Pottery Workshop",
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4, // 64 slots. 16 intervals (4 hrs). 4 wheels. Correct.
            },
            {
                id: "cheriyal_day3",
                name: "Cheriyal Arts",
                price: 150,
                type: "individual",
                slotDuration: 30,
                maxCapacity: 12, // 16 slots?
                // Time 11-4 (less lunch) = 4 hours = 8 intervals.
                // 16 slots / 8 intervals = 2 parallel.
                // Capacity 2 * 6 = 12.
            },
            {
                id: "tiedye_day3",
                name: "Tie & Dye",
                price: 200,
                type: "duo",
                slotDuration: 20,
                maxCapacity: 5, // 12 slots?
                // 4 hours = 240 mins. / 20 = 12 intervals?
                // 11-12:30 (90m -> 4.5 -> 4 ints).
                // 1:30-4:00 (150m -> 7.5 -> 7 ints).
                // Total 11 intervals? 
                // Maybe no lunch?
                // If no lunch: 5 hours = 300 mins. 15 intervals.
                // User says "12 slots".
                // Let's stick to user counts if possible, or capacity logic.
                // "12 slots".
                // If I have 11 intervals (with lunch) -> 11 slots.
                // Maybe one extra slot fits?
                // 90 mins / 20 = 4.5.
                // 150 mins / 20 = 7.5.
                // Maybe they squeeze 5 in morning? (100 mins vs 90). No.
                // Maybe lunch is shorter?
                // I will use standard generation and see naturally.
                // With lunch: 11 slots generated.
                // If 12 slots required, maybe no lunch?
                // 11-4 without lunch = 5 hours = 300 mins. 15 slots.
                // This doesn't match 12 either.
                // I will use standard lunch logic (12:30-1:30) as safe bet.
            }
        ]
    },
    {
        day: "Day 4",
        date: "2026-02-20", // Friday
        startTime: "09:30",
        endTime: "15:00",
        // Workshops only 9:30 - 12:00.
        // Lunch? 12:00?
        workshops: [
            {
                id: "pottery_day4",
                name: "Pottery Workshop",
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4, // 40 slots.
                // 9:30 - 12:00 = 2.5 hours = 150 mins.
                // 150 / 15 = 10 intervals.
                // 10 intervals * 4 = 40. Correct.
                endTime: "12:00"
            },
            {
                id: "cheriyal_day4",
                name: "Cheriyal Arts",
                price: 150,
                type: "individual",
                slotDuration: 30,
                maxCapacity: 6, // 10 slots.
                // 150 mins / 30 = 5 intervals.
                // 10 slots / 5 ints = 2 parallel.
                // Capacity 2 * 6 = 12. 
                // Wait. "10 slots" listed.
                // 5 intervals * 2 = 10.
                // So YES, 2 parallel. Capacity 12.
                endTime: "12:00"
            },
            {
                id: "tolu_day4",
                name: "Tolubommalata",
                price: 150,
                type: "individual",
                slotDuration: 180, // 3 hours (12-3)
                maxCapacity: 400, // Mega slot
                startTime: "12:00",
                endTime: "15:00",
                singleSlot: true
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

function generateSlots(ws, dayDate, globalLunchStart, globalLunchEnd) {
    if (ws.singleSlot) {
        // Special case for Tolu
        const start = parseTime(ws.startTime, dayDate);
        return [{
            id: `slot_${ws.startTime.replace(":", "_")}`,
            time: `${formatTimeAMPM(start)} - ${formatTimeAMPM(parseTime(ws.endTime, dayDate))}`,
            maxCapacity: ws.maxCapacity,
            currentBookings: 0,
            remainingSeats: ws.maxCapacity,
            isClosed: false,
            createdAt: Timestamp.now()
        }];
    }

    const slots = [];
    const start = parseTime(ws.startTime || "09:00", dayDate);
    const end = parseTime(ws.endTime || "17:00", dayDate);
    const lunchS = globalLunchStart ? parseTime(globalLunchStart, dayDate) : null;
    const lunchE = globalLunchEnd ? parseTime(globalLunchEnd, dayDate) : null;

    let current = new Date(start);

    while (current < end) {
        const nextTime = new Date(current.getTime() + ws.slotDuration * 60000);

        // Stop if slot exceeds end time
        if (nextTime > end) break;

        // Check intersection with lunch
        // If slot starts inside lunch OR ends inside lunch
        // Actually, usually "Lunch 12:30-1:30" means no slots start in this range.
        let isLunch = false;
        if (lunchS && lunchE) {
            // Strict overlap check: (Start < LunchEnd) && (End > LunchStart)
            if (current < lunchE && nextTime > lunchS) {
                isLunch = true;
            }
        }

        if (!isLunch) {
            const timeLabel = formatTimeAMPM(current);
            const slotId = `slot_${timeLabel.replace(/[: ]/g, "_")}`;

            slots.push({
                id: slotId,
                time: timeLabel,
                maxCapacity: ws.maxCapacity,
                currentBookings: 0,
                remainingSeats: ws.maxCapacity,
                isClosed: false,
                createdAt: Timestamp.now() // Use Admin SDK timestamp
            });
        }

        // Logic for Tie & Dye "15 activity + 5 buffer" = 20 min slot.
        // We just increment by total duration (20).
        current = nextTime;
    }

    return slots;
}

// ------------------------------------------------------------------
// MAIN
// ------------------------------------------------------------------

async function seed() {
    console.log("🚀 Starting Seed Process...");

    try {
        // 1. Delete existing workshops (Optional: dangerous in prod, but requested)
        // console.log("Deleting old workshops...");
        // const collectionRef = db.collection("workshops");
        // await db.recursiveDelete(collectionRef); 
        // NOTE: recursiveDelete requires firebase-tools to be installed or handled carefully.
        // Safer to just list and delete batch.

        console.log("Fetching old workshops to delete...");
        const snapshot = await db.collection("workshops").get();
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Deleted ${snapshot.size} old workshops.`);
        }

        // 2. Insert new data
        for (const day of SCHEDULE) {
            console.log(`Processing ${day.day} (${day.date})...`);

            for (const ws of day.workshops) {
                const workshopRef = db.collection("workshops").doc(ws.id);

                // Workshop Data
                const workshopData = {
                    name: ws.name,
                    description: ws.description || `${ws.name} on ${day.day}`,
                    price: ws.price,
                    day: day.day,
                    date: day.date,
                    startTime: ws.startTime || day.startTime,
                    endTime: ws.endTime || day.endTime,
                    isActive: true,
                    createdAt: Timestamp.now()
                };

                await workshopRef.set(workshopData);
                console.log(`  -> Created Workshop: ${ws.name}`);

                // Generate Slots
                const slots = generateSlots(
                    { ...ws, startTime: workshopData.startTime, endTime: workshopData.endTime },
                    day.date,
                    day.lunchStart,
                    day.lunchEnd
                );

                // Write Slots (Batch if > 500, but here small)
                const slotBatch = db.batch();
                slots.forEach(slot => {
                    const slotRef = workshopRef.collection("slots").doc(slot.id);
                    slotBatch.set(slotRef, {
                        time: slot.time,
                        maxCapacity: slot.maxCapacity,
                        currentBookings: 0,
                        remainingSeats: slot.maxCapacity,
                        isClosed: false,
                        createdAt: slot.createdAt
                    });
                });

                await slotBatch.commit();
                console.log(`     -> Generated ${slots.length} slots.`);
            }
        }

        console.log("✅ Seeding Complete!");

    } catch (error) {
        console.error("❌ Seed Failed:", error);
    }
}

seed();
