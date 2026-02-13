/**
 * Email Sender Utility using Nodemailer
 * Configured for Gmail SMTP
 */

const nodemailer = require('nodemailer');

// Gmail SMTP Configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'cbitnss@cbit.ac.in',
        pass: 'forthegreatergood'
    }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (fallback)
 * @returns {Promise} - Resolution indicates success/failure
 */
async function sendEmail({ to, subject, html, text }) {
    const mailOptions = {
        from: {
            name: 'Kalakrithi - CBIT NSS',
            address: 'cbitnss@cbit.ac.in'
        },
        to,
        subject,
        html,
        text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
}

/**
 * Send email with retry logic
 * @param {Object} options - Email options
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise}
 */
async function sendEmailWithRetry(options, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Email send attempt ${attempt}/${maxRetries} to ${options.to}`);
            const result = await sendEmail(options);
            return result;
        } catch (error) {
            lastError = error;
            console.error(`Email attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    // All retries failed
    throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError.message}`);
}

module.exports = {
    sendEmail,
    sendEmailWithRetry
};
