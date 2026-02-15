const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // Make sure this path is correct

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const auth = admin.auth();

async function createAdmin(email, password) {
    try {
        console.log(`Creating admin user: ${email}...`);

        // 1. Create Authentication User
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
            console.log("User already exists in Auth. Updating role...");
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                userRecord = await auth.createUser({
                    email: email,
                    password: password,
                    emailVerified: true,
                });
                console.log("User created in Auth.");
            } else {
                throw error;
            }
        }

        // 2. Create/Update Admin Document in Firestore
        await db.collection("admins").doc(userRecord.uid).set({
            email: email,
            role: "admin",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log(`✅ Success! Admin created/updated.`);
        console.log(`   Email: ${email}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`\nYou can now login at: http://localhost:3000/admin/login`);

    } catch (error) {
        console.error("❌ Error creating admin:", error);
    }
}

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log("Usage: node scripts/createAdmin.js <email> <password>");
    process.exit(1);
}

createAdmin(email, password);
