/**
 * Email Templates for Kalakrithi Registration Confirmations
 */

/**
 * Workshop Registration Email Template
 * @param {Object} data - Registration data
 * @returns {Object} { subject, html, text }
 */
function workshopRegistrationEmail(data) {
    const { name, email, workshopName, rollNumber, college, phone, registrationDate } = data;

    const subject = `✅ Workshop Registration Confirmed - ${workshopName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-label { font-weight: bold; color: #6b7280; }
        .info-value { color: #111827; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Kalakrithi Workshop</h1>
            <p style="margin: 10px 0 0 0;">Registration Confirmed!</p>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Congratulations! Your registration for the workshop has been successfully confirmed.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #dc2626;">Workshop Details</h3>
                <div class="info-row">
                    <span class="info-label">Workshop:</span>
                    <span class="info-value">${workshopName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Participant:</span>
                    <span class="info-value">${name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Roll Number:</span>
                    <span class="info-value">${rollNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">College:</span>
                    <span class="info-value">${college}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${phone}</span>
                </div>
                <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Registration Date:</span>
                    <span class="info-value">${registrationDate}</span>
                </div>
            </div>

            <h3 style="color: #dc2626;">What to Bring:</h3>
            <ul>
                <li>Valid College ID Card</li>
                <li>This confirmation email (printed or digital)</li>
                <li>Enthusiasm and creativity!</li>
            </ul>

            <h3 style="color: #dc2626;">Important Notes:</h3>
            <ul>
                <li>Please arrive 15 minutes before the workshop starts</li>
                <li>All materials will be provided</li>
                <li>Certificates will be issued upon completion</li>
            </ul>

            <p style="margin-top: 30px;">
                <strong>Need help?</strong><br>
                Contact us at <a href="mailto:cbitnss@cbit.ac.in">cbitnss@cbit.ac.in</a>
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Kalakrithi - CBIT NSS<br>
            This is an automated confirmation email.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Kalakrithi Workshop Registration Confirmed

Dear ${name},

Congratulations! Your registration for the workshop has been successfully confirmed.

WORKSHOP DETAILS:
- Workshop: ${workshopName}
- Participant: ${name}
- Roll Number: ${rollNumber}
- College: ${college}
- Email: ${email}
- Phone: ${phone}
- Registration Date: ${registrationDate}

WHAT TO BRING:
- Valid College ID Card
- This confirmation email (printed or digital)
- Enthusiasm and creativity!

IMPORTANT NOTES:
- Please arrive 15 minutes before the workshop starts
- All materials will be provided
- Certificates will be issued upon completion

Need help?
Contact us at cbitnss@cbit.ac.in

---
© 2026 Kalakrithi - CBIT NSS
This is an automated confirmation email.
    `;

    return { subject, html, text };
}

/**
 * Game Registration Email Template
 * @param {Object} data - Registration data
 * @returns {Object} { subject, html, text }
 */
function gameRegistrationEmail(data) {
    const { teamName, captainName, email, gameName, rollNumber, college, phone, teamMembers, registrationDate } = data;

    const subject = `✅ Game Registration Confirmed - ${gameName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-label { font-weight: bold; color: #6b7280; }
        .info-value { color: #111827; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 Arangetra Games</h1>
            <p style="margin: 10px 0 0 0;">Team Registration Confirmed!</p>
        </div>
        <div class="content">
            <p>Dear ${captainName},</p>
            <p>Congratulations! Your team registration for Arangetra has been successfully confirmed.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #2563eb;">Team Details</h3>
                <div class="info-row">
                    <span class="info-label">Game:</span>
                    <span class="info-value">${gameName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Team Name:</span>
                    <span class="info-value">${teamName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Team Captain:</span>
                    <span class="info-value">${captainName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Roll Number:</span>
                    <span class="info-value">${rollNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">College:</span>
                    <span class="info-value">${college}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${phone}</span>
                </div>
                ${teamMembers ? `
                <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Team Members:</span>
                    <span class="info-value">${teamMembers.replace(/\n/g, ', ')}</span>
                </div>
                ` : ''}
                <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Registration Date:</span>
                    <span class="info-value">${registrationDate}</span>
                </div>
            </div>

            <h3 style="color: #2563eb;">What to Bring:</h3>
            <ul>
                <li>Valid College ID Cards for all team members</li>
                <li>This confirmation email (printed or digital)</li>
                <li>Sporting spirit and team coordination!</li>
            </ul>

            <h3 style="color: #2563eb;">Important Notes:</h3>
            <ul>
                <li>All team members must arrive 30 minutes before the game starts</li>
                <li>Team captain is responsible for team coordination</li>
                <li>Follow game rules and respect opponents</li>
                <li>Participation certificates will be awarded</li>
            </ul>

            <p style="margin-top: 30px;">
                <strong>Need help?</strong><br>
                Contact us at <a href="mailto:cbitnss@cbit.ac.in">cbitnss@cbit.ac.in</a>
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Arangetra - CBIT NSS<br>
            This is an automated confirmation email.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Arangetra Game Registration Confirmed

Dear ${captainName},

Congratulations! Your team registration for Arangetra has been successfully confirmed.

TEAM DETAILS:
- Game: ${gameName}
- Team Name: ${teamName}
- Team Captain: ${captainName}
- Roll Number: ${rollNumber}
- College: ${college}
- Email: ${email}
- Phone: ${phone}
${teamMembers ? `- Team Members: ${teamMembers.replace(/\n/g, ', ')}` : ''}
- Registration Date: ${registrationDate}

WHAT TO BRING:
- Valid College ID Cards for all team members
- This confirmation email (printed or digital)
- Sporting spirit and team coordination!

IMPORTANT NOTES:
- All team members must arrive 30 minutes before the game starts
- Team captain is responsible for team coordination
- Follow game rules and respect opponents
- Participation certificates will be awarded

Need help?
Contact us at cbitnss@cbit.ac.in

---
© 2026 Arangetra - CBIT NSS
This is an automated confirmation email.
    `;

    return { subject, html, text };
}

module.exports = {
    workshopRegistrationEmail,
    gameRegistrationEmail
};
