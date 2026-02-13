# Quick Fix for Drive API Error

## The Problem

Your service account requires the Google Drive API to be enabled for **project number 706514210362**.

You may have enabled it for a different project (the Firebase project `kalakrithixarangetra`), but the service account credentials are registered under a different Google Cloud project.

## The Solution

**Click this direct link to enable the API for the correct project:**

👉 **https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=706514210362**

Then:
1. Click the **"ENABLE"** button
2. Wait for the success message
3. Wait 2-3 minutes for it to propagate
4. Restart your dev server
5. Try uploading again

## Alternative: Find Your Project

If the link doesn't work:

1. Go to: https://console.cloud.google.com/
2. Look for project **"kalakrithi-arangetra"** or project number **"706514210362"**
3. Select it from the dropdown at the top
4. Go to **APIs & Services** → **Library**
5. Search for "Google Drive API"
6. Click **Enable**

## How to Verify It's Enabled

After enabling:

1. Go to: https://console.cloud.google.com/apis/dashboard?project=706514210362
2. You should see "Google Drive API" in the list of enabled APIs
3. If it shows "Enabled", you're good to go!

## Still Not Working?

If you still get errors after waiting 5+ minutes:

1. **Check the project in Cloud Console:**
   - Your service account email is: `kalakrithi-drive-uploader@kalakrithi-arangetra.iam.gserviceaccount.com`
   - This service account must exist in the project where you enabled the Drive API

2. **Verify the service account exists:**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=706514210362
   - Look for `kalakrithi-drive-uploader@kalakrithi-arangetra.iam.gserviceaccount.com`
   - If it's not there, you created the service account in the wrong project

3. **Create a new service account in the correct project:**
   - If needed, follow `GDRIVE_SETUP.md` again but make absolutely sure you're in project `706514210362`
