import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/src/firebase";

/**
 * Compress image before upload
 * @param {File} file - Original file
 * @param {number} maxWidth - Max width in pixels (default 1200)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<Blob>} - Compressed blob
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Compression failed"));
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

/**
 * Upload payment screenshot to Firebase Storage
 * Path: payment-screenshots/{workshopId}/{slotId}/{rollNumber}.jpg
 */
export const uploadPaymentScreenshot = async (file, workshopId, slotId, rollNumber, onProgress) => {
    try {
        // 1. Compress Image
        const compressedBlob = await compressImage(file);

        // 2. Define Path
        const filePath = `payment-screenshots/${workshopId}/${slotId}/${rollNumber}.jpg`;
        const storageRef = ref(storage, filePath);

        // 3. Upload Task
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
            contentType: 'image/jpeg',
        });

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    // Handle specific error cases if needed
                    console.error("Upload error:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });

    } catch (error) {
        console.error("Error in upload service:", error);
        throw error;
    }
};
