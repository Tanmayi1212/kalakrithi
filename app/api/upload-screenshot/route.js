import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

// Use the full bucket name from environment
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
console.log('🪣 Using bucket:', bucketName);
const bucket = admin.storage().bucket(bucketName);

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const rollNumber = formData.get('rollNumber');

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!rollNumber) {
            return NextResponse.json(
                { success: false, error: 'Roll number is required' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File must be under 5MB' },
                { status: 400 }
            );
        }

        console.log('📤 Server: Uploading screenshot for roll number:', rollNumber);
        console.log('📄 Server: File received:', {
            name: file.name,
            type: file.type,
            size: `${(file.size / 1024).toFixed(2)} KB`,
        });

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create filename with timestamp
        const timestamp = Date.now();
        const filename = `payment-screenshots/${rollNumber}_${timestamp}.jpg`;

        // Upload to Firebase Storage
        const fileRef = bucket.file(filename);

        await fileRef.save(buffer, {
            metadata: {
                contentType: 'image/jpeg',
                metadata: {
                    rollNumber: rollNumber,
                    uploadedAt: new Date().toISOString(),
                },
            },
            resumable: false,
        });

        console.log('✅ Server: File uploaded successfully:', filename);

        // Make file publicly accessible
        await fileRef.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        console.log('🔗 Server: Public URL:', publicUrl);

        return NextResponse.json({
            success: true,
            url: publicUrl,
        });

    } catch (error) {
        console.error('❌ Server: Upload error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
