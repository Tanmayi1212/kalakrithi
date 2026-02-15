"use client";

import { useState } from "react";
import {
    collection,
    getDocs,
    writeBatch,
    Timestamp,
    doc
} from "firebase/firestore";
import { db } from "@/src/firebase";
import toast from "react-hot-toast";

const YEAR = 2026;

// Data Schedule
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
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4,
                startTime: "11:00",
                endTime: "16:00"
            },
            {
                id: "cheriyal_day1",
                name: "Cheriyal Arts",
                description: "Traditional Telangana art form.",
                price: 150,
                type: "individual",
                slotDuration: 30,
                maxCapacity: 12,
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
                maxCapacity: 4,
            },
            {
                id: "cheriyal_day2",
                name: "Cheriyal Arts",
                price: 150,
                type: "individual",
                slotDuration: 30,
                maxCapacity: 12,
            },
            {
                id: "tiedye_day2",
                name: "Tie & Dye",
                price: 200,
                type: "duo",
                slotDuration: 20,
                maxCapacity: 5,
            }
        ]
    },
    {
        day: "Day 3",
        date: "2026-02-19", // Thursday
        startTime: "11:00",
        endTime: "16:00",
        lunchStart: "12:30",
        lunchEnd: "13:30",
        workshops: [
            {
                id: "pottery_day3",
                name: "Pottery Workshop",
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4,
            },
            {
                id: "cheriyal_day3",
                name: "Cheriyal Arts",
                price: 150,
                type: "individual",
                slotDuration: 30,
                maxCapacity: 12,
            },
            {
                id: "tiedye_day3",
                name: "Tie & Dye",
                price: 200,
                type: "duo",
                slotDuration: 20,
                maxCapacity: 5,
            }
        ]
    },
    {
        day: "Day 4",
        date: "2026-02-20", // Friday
        startTime: "09:30",
        endTime: "15:00",
        workshops: [
            {
                id: "pottery_day4",
                name: "Pottery Workshop",
                price: 150,
                type: "duo",
                slotDuration: 15,
                maxCapacity: 4,
                endTime: "12:00"
            },
            {
                id: "cheriyal_day4",
                name: "Cheriyal Arts",
                price: 150,
                type: "individual",
                slotDuration: 30,
                maxCapacity: 6, // 10 slots? As per user update: 10 slots. 5 intervals * 2 = 10. Capacity 12?
                // Wait, "10 slots" capacity vs intervals.
                // User said: "10 slots -> 6 per slot".
                // 9:30-12:00 = 150 mins / 30 = 5 intervals.
                // To get 10 slots, we need 2 parallel.
                // So maxCapacity per interval = 2 * 6 = 12.
                // Let's stick to 12.
                maxCapacity: 12,
                endTime: "12:00"
            },
            {
                id: "tolu_day4",
                name: "Tolubommalata",
                price: 150,
                type: "individual",
                slotDuration: 180, // 3 hours
                maxCapacity: 400,
                startTime: "12:00",
                endTime: "15:00",
                singleSlot: true
            }
        ]
    }
];

// Helpers
function parseTime(timeStr, dateStr) {
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
        if (nextTime > end) break;

        let isLunch = false;
        if (lunchS && lunchE) {
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
                createdAt: Timestamp.now()
            });
        }
        current = nextTime;
    }

    return slots;
}

export default function SeederPage() {
    const [status, setStatus] = useState("Idle");
    const [logs, setLogs] = useState([]);

    const log = (msg) => setLogs(prev => [...prev, msg]);

    const runSeed = async () => {
        if (!confirm("⚠️ WARNING: This will DELETE ALL existing workshops and replace them with the simplified schedule. Continue?")) return;

        setStatus("Running");
        setLogs([]);
        log("🚀 Starting Seed Process...");

        try {
            // 1. Delete Old Workshops
            log("Deleting old workshops...");
            const oldSnapshot = await getDocs(collection(db, "workshops"));
            const deleteBatch = writeBatch(db);
            let deletedCount = 0;

            oldSnapshot.forEach(doc => {
                deleteBatch.delete(doc.ref);
                deletedCount++;
            });

            if (deletedCount > 0) {
                await deleteBatch.commit();
                log(`Deleted ${deletedCount} old workshops.`);
            } else {
                log("No old workshops found.");
            }

            // 2. Create New
            for (const day of SCHEDULE) {
                log(`Processing ${day.day}...`);

                for (const ws of day.workshops) {
                    const wsRef = doc(collection(db, "workshops"), ws.id);

                    // Create Workshop Doc
                    await writeBatch(db).set(wsRef, {
                        name: ws.name,
                        description: ws.description || `${ws.name} on ${day.day}`,
                        price: ws.price,
                        day: day.day,
                        date: day.date,
                        startTime: ws.startTime || day.startTime,
                        endTime: ws.endTime || day.endTime,
                        isActive: true, // IMPORTANT: Ensure it shows up
                        createdAt: Timestamp.now()
                    }).commit();

                    log(`  -> Created ${ws.name}`);

                    // Generate Slots
                    const slots = generateSlots(
                        { ...ws, startTime: ws.startTime || day.startTime, endTime: ws.endTime || day.endTime },
                        day.date,
                        day.lunchStart,
                        day.lunchEnd
                    );

                    // Write Slots (Batch)
                    const slotBatch = writeBatch(db);
                    let slotCount = 0;
                    slots.forEach(slot => {
                        const slotRef = doc(collection(db, "workshops", ws.id, "slots"), slot.id);
                        slotBatch.set(slotRef, {
                            time: slot.time,
                            maxCapacity: slot.maxCapacity,
                            currentBookings: 0,
                            remainingSeats: slot.maxCapacity,
                            isClosed: false,
                            createdAt: slot.createdAt
                        });
                        slotCount++;
                    });

                    await slotBatch.commit();
                    log(`     -> Added ${slotCount} slots.`);
                }
            }

            log("✅ Seeding Complete! Go back to registration page.");
            toast.success("Seeding Done!");
            setStatus("Success");

        } catch (error) {
            console.error(error);
            log(`❌ Error: ${error.message}`);
            toast.error("Seeding Failed");
            setStatus("Error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-4 text-red-600">⚠️ Admin Data Seeder</h1>
                <p className="text-gray-600 mb-6">
                    Use this tool to reset and populate the database with the official Workshop schedule.
                    <br />
                    <strong className="text-red-600">Warning: This will delete all existing workshops.</strong>
                </p>

                <div className="mb-6 p-4 bg-gray-900 rounded-xl font-mono text-sm text-green-400 h-64 overflow-y-auto">
                    {logs.length === 0 ? (
                        <span className="text-gray-500">Logs will appear here...</span>
                    ) : (
                        logs.map((L, i) => <div key={i}>{L}</div>)
                    )}
                </div>

                <button
                    onClick={runSeed}
                    disabled={status === "Running"}
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all
                        ${status === "Running" ? "bg-gray-400 cursor-wait" : "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl"}
                    `}
                >
                    {status === "Running" ? "Seeding in Progress..." : "🚨 RUN SEED & PREPARE DATABASE"}
                </button>

                {status === "Success" && (
                    <div className="mt-4 text-center">
                        <a href="/register/workshops" className="text-blue-600 hover:underline">
                            Go to Registration Page &rarr;
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
