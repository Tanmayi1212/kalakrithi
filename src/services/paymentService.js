/**
 * Payment Service - Handles payment screenshot uploads to Google Drive
 */


/**
 * Compress image before upload to reduce size and upload time
 */
async function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale down if larger than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

/**
 * Upload payment screenshot to Google Drive via API
 * @param {File} file - Payment screenshot file
 * @param {string} rollNumber - Student's roll number
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Download URL of uploaded screenshot
 */
export async function uploadPaymentScreenshot(file, rollNumber, onProgress = null) {
    console.log("📤 Uploading payment screenshot for:", rollNumber);
    console.log("📄 Original file:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
    });

    try {
        // Validate file
        if (!file.type.startsWith("image/")) {
            throw new Error("File must be an image");
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be less than 5MB");
        }

        // Compress image to reduce upload time
        console.log("🔄 Compressing image...");
        const compressedFile = await compressImage(file);
        console.log("✅ Compressed to:", `${(compressedFile.size / 1024).toFixed(2)} KB`);
        console.log("💾 Size reduction:", `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`);

        // Upload to Google Drive via API
        console.log("📍 Uploading to Google Drive...");

        // Create form data
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('rollNumber', rollNumber);

        // Update progress to show upload starting
        if (onProgress) {
            onProgress(10);
        }

        // Call API route
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        // Update progress
        if (onProgress) {
            onProgress(90);
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();

        if (!data.success || !data.url) {
            throw new Error('Invalid response from upload API');
        }

        // Upload completed
        console.log("✅ Upload complete!");
        console.log("🔗 Drive URL:", data.url);

        if (onProgress) {
            onProgress(100);
        }

        return data.url;

    } catch (error) {
        console.error("❌ Upload error:");
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        throw error;
    }
}

