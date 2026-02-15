"use client";
import { useState, useEffect } from "react";
import { getWorkshops, createBooking, subscribeToWorkshopSlots } from "@/src/services/workshopService";

export default function VerifyBooking() {
    const [status, setStatus] = useState("Idle");
    const [logs, setLogs] = useState([]);
    const [workshops, setWorkshops] = useState([]);

    useEffect(() => {
        getWorkshops().then(setWorkshops);
    }, []);

    const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runVerification = async () => {
        setLogs([]);
        if (workshops.length === 0) {
            addLog("No workshops found to test.");
            return;
        }

        const workshop = workshops[0];
        addLog(`Selected Workshop: ${workshop.name} (${workshop.id})`);

        // Fetch slots
        // We need real slot IDs on the client side, so we use the subscription or just fetch logic
        // For simplicity, we assume we can get slots from the workshop object if available, or we just try to read them.
        // Wait, getWorkshops() might not return slots. We need to fetch slots.

        let slots = [];
        // Just a quick way to get slots using the subscription function once
        await new Promise((resolve) => {
            const unsub = subscribeToWorkshopSlots(workshop.id, (data) => {
                slots = data;
                unsub();
                resolve();
            });
        });

        if (slots.length < 2) {
            addLog("Need at least 2 slots to test duplicate booking.");
            return;
        }

        const slot1 = slots[0];
        const slot2 = slots[1];
        addLog(`Slot 1: ${slot1.time} (${slot1.id})`);
        addLog(`Slot 2: ${slot2.time} (${slot2.id})`);

        const randomRoll = "1601" + Math.floor(10000000 + Math.random() * 90000000);
        addLog(`Generated Test Roll Number: ${randomRoll}`);

        // TEST 1: First Booking (Should Success)
        addLog("--- TEST 1: Booking Slot 1 ---");
        const res1 = await createBooking(workshop.id, slot1.id, {
            rollNumber: randomRoll,
            name: "Test User",
            email: "test@example.com",
            phone: "9999999999",
            college: "Test College"
        });

        if (res1.success) {
            addLog("✅ Booking 1 Success");
        } else {
            addLog("❌ Booking 1 Failed: " + res1.error);
            return;
        }

        // TEST 2: Duplicate Booking in SAME Slot (Should Fail Client Side logic or Server side if logic exists)
        // Actually, our logic checks duplicates globally for the workshop, so same slot or different slot should both fail.
        addLog("--- TEST 2: Booking Slot 2 (Duplicate Roll No) ---");
        const res2 = await createBooking(workshop.id, slot2.id, {
            rollNumber: randomRoll,
            name: "Test User 2",
            email: "test2@example.com",
            phone: "9999999999",
            college: "Test College"
        });

        if (!res2.success && res2.error.includes("already registered")) {
            addLog("✅ Duplicate Check Passed! (Booking 2 Rejected with correct error)");
        } else if (res2.success) {
            addLog("❌ Duplicate Check FAILED! (Booking 2 Created)");
        } else {
            addLog(`⚠️ Booking 2 Failed with valid but unexpected error: ${res2.error}`);
        }

        // TEST 3: Invalid Roll Number
        addLog("--- TEST 3: Invalid Roll Number ---");
        const res3 = await createBooking(workshop.id, slot1.id, {
            rollNumber: "12345",
            name: "Invalid Roll",
            email: "test@example.com",
            phone: "9999999999"
        });
        if (!res3.success && res3.error.includes("Invalid roll number")) {
            addLog("✅ Regex Validation Passed!");
        } else {
            addLog("❌ Regex Validation FAILED!");
        }

        // TEST 4: Check Duplicate Registration Service Function
        addLog("--- TEST 4: checkDuplicateRegistration (Service Function) ---");
        const { checkDuplicateRegistration } = await import("@/src/services/workshopService");
        const checkRes = await checkDuplicateRegistration(workshop.id, randomRoll);
        if (checkRes.exists) {
            addLog(`✅ Service correctly found duplicate in slot: ${checkRes.slotId}`);
        } else {
            addLog("❌ Service FAILED to find duplicate!");
        }

        const checkRes2 = await checkDuplicateRegistration(workshop.id, "160100000000"); // Unused roll
        if (!checkRes2.exists) {
            addLog("✅ Service correctly returned false for unused roll");
        } else {
            addLog("❌ Service FAILED (found non-existent duplicate)");
        }

        setStatus("Finished");
    };

    return (
        <div className="p-10 max-w-2xl mx-auto font-mono">
            <h1 className="text-2xl font-bold mb-4">Verification Console</h1>
            <button
                onClick={runVerification}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
            >
                Run Tests
            </button>
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 min-h-[300px]">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                ))}
            </div>
        </div>
    );
}
