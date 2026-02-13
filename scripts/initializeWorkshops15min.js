/**
 * Initialize Workshops with 15-minute time slots
 * Each slot has maxCapacity = 4
 * Run: node scripts/initializeWorkshops15min.js
 */

const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(process.env.USERPROFILE, 'Downloads', 'kalakrithixarangetra-firebase-adminsdk-fbsvc-aa7b28f0ae.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Workshop data
const workshops = [
    {
        id: 'pottery-workshop',
        name: 'Pottery Workshop',
        description: 'A hands-on session where participants learn basic clay shaping and pottery techniques while exploring the artistic and therapeutic side of working with clay.',
        price: 100,
        isActive: true,
    },
    {
        id: 'tie-dye-workshop',
        name: 'Tie and Dye Workshop',
        description: 'An interactive workshop introducing traditional tie and dye techniques, allowing participants to create unique patterns and understand the craft behind handmade textiles.',
        price: 150,
        isActive: true,
    },
    {
        id: 'painting-workshop',
        name: 'Painting Workshop',
        description: 'This workshop features traditional and contemporary art forms including Cheriyal, Kalamkari, tote bag, and plant pot painting, blending cultural heritage with creative expression.',
        price: 120,
        isActive: true,
    },
];

// Generate 15-minute time slots from 9:00 AM to 5:00 PM
function generateTimeSlots() {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const startTime = formatTime(hour, minute);
            const endMinute = minute + 15;
            const endTime = endMinute === 60
                ? formatTime(hour + 1, 0)
                : formatTime(hour, endMinute);

            slots.push({
                id: `slot-${hour}-${minute}`,
                time: `${startTime} - ${endTime}`,
                maxCapacity: 4,
                isClosed: false,
            });
        }
    }

    return slots;
}

function formatTime(hour, minute) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
}

async function initializeWorkshops() {
    try {
        console.log('🚀 Initializing workshops with 15-minute slots...\n');

        const timeSlots = generateTimeSlots();
        console.log(`📅 Generated ${timeSlots.length} time slots (15-min intervals, 9 AM - 5 PM)\n`);

        for (const workshop of workshops) {
            const { id, ...workshopData } = workshop;

            // Create workshop document
            await db.collection('workshops').doc(id).set({
                ...workshopData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`✅ Created workshop: ${workshopData.name}`);

            // Create all time slots
            for (const slot of timeSlots) {
                await db.collection('workshops').doc(id).collection('slots').doc(slot.id).set({
                    ...slot,
                    workshopId: id,
                    workshopName: workshopData.name,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            console.log(`   ✓ Added ${timeSlots.length} slots (max capacity: 4 each)\n`);
        }

        console.log('🎉 All workshops initialized successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${workshops.length} workshops created`);
        console.log(`   - ${timeSlots.length} slots per workshop`);
        console.log(`   - 4 seats per slot`);
        console.log(`   - Total capacity: ${timeSlots.length * 4} bookings per workshop\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

initializeWorkshops();
