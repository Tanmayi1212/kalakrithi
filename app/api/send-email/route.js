import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { name, email, workshopName, slotTime, paymentStatus } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
        }

        const subject =
            paymentStatus === "confirmed"
                ? "🎉 Booking Confirmed - Kalakrithi Workshop"
                : "❌ Booking Rejected - Kalakrithi Workshop";

        const htmlContent =
            paymentStatus === "confirmed"
                ? `
          <h2>🎉 Booking Confirmed!</h2>
          <p>Hi ${name},</p>
          <p>Your booking for <strong>${workshopName}</strong> has been successfully confirmed.</p>
          <p><strong>Slot:</strong> ${slotTime}</p>
          <p>We look forward to seeing you at Kalakrithi! 🎨</p>
        `
                : `
          <h2>❌ Booking Rejected</h2>
          <p>Hi ${name},</p>
          <p>Unfortunately, your booking for <strong>${workshopName}</strong> has been rejected.</p>
          <p><strong>Slot:</strong> ${slotTime}</p>
          <p>If you believe this is an error, please contact the organizing team.</p>
        `;

        await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: subject,
            html: htmlContent,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email send error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
