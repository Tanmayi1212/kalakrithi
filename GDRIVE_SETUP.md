# Google Drive Setup Guide for Payment Screenshots

## Overview
This guide explains how to set up Google Drive for storing payment screenshots uploaded by students during workshop registration.

## Prerequisites
- A Google Cloud Project
- Access to Google Cloud Console
- Permission to create Service Accounts

## Step 1: Enable Google Drive API

> [!IMPORTANT]
> **This is a required step!** Without enabling the Drive API, uploads will fail with a 500 error.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Library**
4. Search for "**Google Drive API**"
5. Click on "**Google Drive API**"
6. Click **"Enable"** button
7. Wait for confirmation (usually takes ~30 seconds)

## Step 2: Create a Service Account

1. In the same Google Cloud Console
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Click **Create Service Account**
4. Fill in details:
   - **Name**: `kalakrithi-drive-uploader`
   - **Description**: `Service account for uploading payment screenshots to Google Drive`
5. Click **Create and Continue**
6. Skip role assignment (click **Continue**)
7. Click **Done**

## Step 3: Generate Private Key

1. Click on the newly created service account
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Click **Create**
6. Save the downloaded JSON file securely

## Step 4: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder named `Workshop Payment Screenshots`
3. Open the folder
4. Copy the **Folder ID** from the URL:
   ```
   https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
   ```
   The Folder ID is the part after `/folders/`

## Step 5: Share Folder with Service Account

1. Right-click the folder → **Share**
2. Add the service account email (found in the JSON file as `client_email`)
3. Set permission to **Editor**
4. Click **Send** (uncheck "Notify people")

## Step 6: Update Environment Variables

1. Open the downloaded JSON file from Step 3
2. Copy the following values:
   - `client_email`
   - `private_key`
   - Folder ID from Step 4

3. Update `.env.local` file:

```bash
# Google Drive Configuration (for payment screenshot uploads)
GDRIVE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GDRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GDRIVE_FOLDER_ID="your-google-drive-folder-id"
```

**Important Notes:**
- The private key should include `\n` for newlines (keep as-is from JSON)
- Use double quotes around values
- Do NOT commit `.env.local` to version control

## Step 7: Restart Development Server

After updating `.env.local`, restart your Next.js server:

```bash
npm run dev
```

## Testing the Setup

1. Navigate to workshop registration page
2. Select a workshop slot
3. Fill in registration details
4. Upload a test payment screenshot
5. Check the Google Drive folder for the uploaded file
6. Verify the file is publicly accessible

## Troubleshooting

### Error: "Google Drive API has not been used in project... or it is disabled"

**This is the most common error!**

The error will look like:
```
Google Drive API has not been used in project 706514210362 before or it is disabled.
Enable it by visiting https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=706514210362
```

**Solution:**
1. Click the link provided in the error message (it's specific to your project)
2. Click the **"Enable"** button
3. Wait ~1 minute for activation
4. Retry the upload

This happens when you create a service account but forget to enable the Drive API in Step 1.

---

### Error: "Missing Google Drive credentials"
- Ensure all three environment variables are set in `.env.local`
- Restart the development server

### Error: "Permission denied"
- Verify the service account email is added to the Drive folder with Editor permissions
- Check the folder ID is correct

### Error: "Invalid credentials"
- Ensure the private key includes proper newline characters (`\n`)
- Verify you copied the complete private key from the JSON file

### Upload fails silently
- Check browser console for errors
- Verify API route is accessible at `/api/upload`
- Check server logs for detailed error messages

## Security Best Practices

1. **Never commit credentials** to version control
2. **Restrict folder permissions** to only the service account
3. **Monitor folder activity** in Google Drive
4. **Rotate service account keys** periodically
5. **Set file retention policies** if needed

## File Management

Uploaded files follow this naming pattern:
```
{rollNumber}_{timestamp}.jpg
```

Example: `22R21A66A6_1707849123456.jpg`

Files are automatically set to public view to allow display in the admin dashboard.
