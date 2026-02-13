/**
 * QR Code Generator Utility
 * Generate QR codes for confirmed bookings
 */

import QRCode from "qrcode";

/**
 * Generate QR code data URL for a booking
 * @param {Object} booking - Booking object
 * @returns {Promise<string>} Data URL of QR code image
 */
export async function generateBookingQR(booking) {
    try {
        const qrData = JSON.stringify({
            rollNumber: booking.rollNumber,
            name: booking.name,
            workshop: booking.workshopName,
            slot: booking.slotTime,
            bookingId: booking.id,
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: "#DC2626", // Red-600
                light: "#FFFFFF",
            },
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error("Error generating QR code:", error);
        throw new Error("Failed to generate QR code");
    }
}

/**
 * Download QR code as PNG
 * @param {string} dataURL - QR code data URL
 * @param {string} filename - Filename for download
 */
export function downloadQRCode(dataURL, filename) {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename || "booking-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
