import { google } from 'googleapis';
import { NextResponse } from 'next/server';

/**
 * API Route: Upload payment screenshot to Google Drive
 * POST /api/upload
 * 
 * Accepts multipart/form-data with a file
 * Returns: { success: true, url: "drive-file-link" }
 */
export async function POST(request) {
    try {
        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get('file');
        const rollNumber = formData.get('rollNumber');

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
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

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        // Get credentials from environment variables
        const clientEmail = process.env.GDRIVE_CLIENT_EMAIL;
        const privateKey = process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const folderId = process.env.GDRIVE_FOLDER_ID;

        if (!clientEmail || !privateKey || !folderId) {
            console.error('Missing Google Drive credentials');
            return NextResponse.json(
                { success: false, error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Initialize Google Drive API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create filename
        const timestamp = Date.now();
        const filename = `${rollNumber}_${timestamp}.jpg`;

        // Upload file to Google Drive
        const fileMetadata = {
            name: filename,
            parents: [folderId],
        };

        const media = {
            mimeType: file.type,
            body: require('stream').Readable.from(buffer),
        };

        const driveFile = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        // Make file publicly accessible
        await drive.permissions.create({
            fileId: driveFile.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Get public URL
        const fileId = driveFile.data.id;
        const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

        console.log('✅ File uploaded to Google Drive:', publicUrl);

        return NextResponse.json({
            success: true,
            url: publicUrl,
        });

    } catch (error) {
        console.error('❌ Google Drive upload error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
