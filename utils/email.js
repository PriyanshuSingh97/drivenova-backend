// utils/email.js
const nodemailer = require('nodemailer');

// Ensure essential email environment variables are configured before proceeding
if (!process.env.EMAIL_SMTP_HOST || !process.env.EMAIL_SMTP_USER || !process.env.EMAIL_SMTP_PASS || !process.env.NOTIFY_EMAIL) {
    console.warn('❌ Email service is not configured. Email notifications will be disabled. Please check your .env file.');
}

// Configure the email transporter with credentials from the .env file
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
    secure: process.env.EMAIL_SMTP_SECURE === 'true', // `true` for 465, `false` for other ports
    auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
    },
});

// Sends a notification email to the site owner
// @param {string} subject - Subject line of the email
// @param {string} htmlContent - HTML body content of the email

const sendNotificationEmail = async (subject, htmlContent) => {
    // Silently fail if the email service is not configured, preventing crashes
    if (!transporter.options.host) {
        console.warn('Email sending skipped because SMTP is not configured.');
        return;
    }

    try {
        await transporter.sendMail({
            from: `"DriveNova Notifier" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_SMTP_USER}>`,
            to: process.env.NOTIFY_EMAIL,
            subject: subject,
            html: htmlContent,
        });
        console.log(`✅ Notification email sent: "${subject}"`);
    } catch (error) {
        console.error(`❌ Failed to send notification email. Subject: "${subject}"`, error);
    }
};

module.exports = { sendNotificationEmail };
