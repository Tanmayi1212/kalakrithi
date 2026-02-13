/**
 * CSV Export Utility
 * Generate and download CSV files for bookings export
 */

/**
 * Export confirmed bookings as CSV
 * @param {Array} bookings - Array of booking objects
 * @param {string} filename - Optional filename (default: bookings-export-{date}.csv)
 */
export function exportBookingsCSV(bookings, filename) {
    try {
        // Define CSV headers
        const headers = [
            "Name",
            "Roll Number",
            "Phone",
            "Email",
            "Workshop",
            "Slot",
            "Transaction ID",
            "Confirmed At",
        ];

        // Convert bookings to CSV rows
        const rows = bookings.map((booking) => [
            booking.name || "",
            booking.rollNumber || "",
            booking.phone || "",
            booking.email || "",
            booking.workshopName || "",
            booking.slotTime || "",
            booking.transactionId || "",
            booking.confirmedAt
                ? new Date(booking.confirmedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                })
                : "",
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        // Generate filename with current date
        const defaultFilename = `bookings-export-${new Date().toISOString().split("T")[0]
            }.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", filename || defaultFilename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error("Error exporting CSV:", error);
        return { success: false, error: "Failed to export CSV" };
    }
}

/**
 * Export workshop-wise bookings summary
 * @param {Array} bookings - Array of booking objects
 */
export function exportWorkshopSummaryCSV(bookings) {
    try {
        // Group by workshop
        const workshopGroups = {};
        bookings.forEach((booking) => {
            const workshop = booking.workshopName || "Unknown";
            if (!workshopGroups[workshop]) {
                workshopGroups[workshop] = [];
            }
            workshopGroups[workshop].push(booking);
        });

        // Define CSV headers
        const headers = ["Workshop", "Total Bookings", "Workshop Details"];

        // Create rows
        const rows = Object.entries(workshopGroups).map(([workshop, items]) => [
            workshop,
            items.length,
            `${items.length} confirmed registrations`,
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        const filename = `workshop-summary-${new Date().toISOString().split("T")[0]
            }.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error("Error exporting workshop summary:", error);
        return { success: false, error: "Failed to export summary" };
    }
}
