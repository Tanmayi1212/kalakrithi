/**
 * Payment Service - Handles payment screenshot uploads via server-side API
 */

/**
 * Compress image before upload to reduce size and upload time
 * Aggressive compression for fast uploads even on slow networks
 */
async function compressImage(file, maxWidth = 1000, quality = 0.7) {
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
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

/**
 * Upload payment screenshot to Firebase Storage
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
        // Validate file type
        if (!file.type.startsWith("image/")) {
            throw new Error("File must be an image");
        }

        // Validate file size (before compression)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be less than 5MB");
        }

        // Compress image aggressively for fast uploads
        console.log("🔄 Compressing image (max 1000px, quality 0.7)...");
        const compressedFile = await compressImage(file, 1000, 0.7);

        const originalSizeKB = (file.size / 1024).toFixed(2);
        const compressedSizeKB = (compressedFile.size / 1024).toFixed(2);
        const reductionPercent = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

        console.log("✅ Compressed successfully!");
        console.log(`   Original: ${originalSizeKB} KB`);
        console.log(`   Compressed: ${compressedSizeKB} KB`);
        console.log(`   Reduction: ${reductionPercent}%`);

        // Upload via server-side API (bypasses CORS completely)
        console.log("📍 Uploading via server API...");

        // Update progress to show upload starting
        if (onProgress) {
            onProgress(10);
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('rollNumber', rollNumber);

        // Call API route
        const response = await fetch('/api/upload-screenshot', {
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
        console.log("🔗 Firebase Storage URL:", data.url);

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
