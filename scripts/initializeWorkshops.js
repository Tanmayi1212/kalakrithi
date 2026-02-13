/**
 * Initialize Workshops and Slots in Firestore
 * Run this script to populate the database with workshop data
 * 
 * Usage: node scripts/initializeWorkshops.js
 */

const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(process.env.USERPROFILE, 'Downloads', 'kalakrithixarangetra-firebase-adminsdk-fbsvc-aa7b28f0ae.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const workshops = [
    {
        id: 'pottery-workshop',
        name: 'Pottery Workshop',
        description: 'A hands-on session where participants learn basic clay shaping and pottery techniques while exploring the artistic and therapeutic side of working with clay.',
        price: 100,
        image: '/images/pottery.jpg',
        duration: '2 hours',
        maxParticipants: 30,
        slots: [
            { id: 'slot-1', time: '10:00 AM - 12:00 PM', maxCapacity: 15, currentBookings: 0, status: 'open' },
            { id: 'slot-2', time: '2:00 PM - 4:00 PM', maxCapacity: 15, currentBookings: 0, status: 'open' },
        ]
    },
    {
        id: 'tie-dye-workshop',
        name: 'Tie and Dye Workshop',
        description: 'An interactive workshop introducing traditional tie and dye techniques, allowing participants to create unique patterns and understand the craft behind handmade textiles.',
        price: 150,
        image: '/images/tie-dye.jpg',
        duration: '2 hours',
        maxParticipants: 25,
        slots: [
            { id: 'slot-1', time: '10:00 AM - 12:00 PM', maxCapacity: 12, currentBookings: 0, status: 'open' },
            { id: 'slot-2', time: '2:00 PM - 4:00 PM', maxCapacity: 13, currentBookings: 0, status: 'open' },
        ]
    },
    {
        id: 'painting-workshop',
        name: 'Painting Workshop',
        description: 'This workshop features traditional and contemporary art forms including Cheriyal, Kalamkari, tote bag, and plant pot painting, blending cultural heritage with creative expression.',
        price: 120,
        image: '/images/painting.jpg',
        duration: '2.5 hours',
        maxParticipants: 40,
        slots: [
            { id: 'slot-1', time: '9:00 AM - 11:30 AM', maxCapacity: 20, currentBookings: 0, status: 'open' },
            { id: 'slot-2', time: '1:00 PM - 3:30 PM', maxCapacity: 20, currentBookings: 0, status: 'open' },
        ]
    }
];

async function initializeWorkshops() {
    try {
        console.log('🚀 Starting workshop initialization...\n');

        for (const workshop of workshops) {
            const { id, slots, ...workshopData } = workshop;

            // Create workshop document
            await db.collection('workshops').doc(id).set({
                ...workshopData,
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`✅ Created workshop: ${workshopData.name}`);

            // Create slots subcollection
            for (const slot of slots) {
                await db.collection('workshops').doc(id).collection('slots').doc(slot.id).set({
                    ...slot,
                    workshopId: id,
                    workshopName: workshopData.name,
                    isClosed: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log(`   ✓ Added slot: ${slot.time}`);
            }

            console.log('');
        }

        console.log('🎉 All workshops initialized successfully!');
        console.log('\nYou can now view them in Firebase Console:');
        console.log('Firestore Database → workshops collection\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing workshops:', error);
        process.exit(1);
    }
}

initializeWorkshops();
