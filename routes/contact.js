// routes/contact.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendNotificationEmail } = require('../utils/email');

// POST /api/contact - Save a new contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, message, phone } = req.body;
        if (!name || !email || !message || !phone) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const newContactMessage = new Contact({ name, email, phone, message });
        await newContactMessage.save();

        // Send Notification Email
        const emailHtml = `
            <h2>📬 New Contact Form Submission</h2>
            <p>You have received a new message from the contact form.</p>
            <ul>
                <li><strong>Name:</strong> ${newContactMessage.name}</li>
                <li><strong>Email:</strong> ${newContactMessage.email}</li>
                <li><strong>Phone:</strong> ${newContactMessage.phone}</li>
                <li><strong>Message:</strong></li>
            </ul>
            <p style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
                ${newContactMessage.message}
            </p>
        `;
        sendNotificationEmail(`New Contact Message from ${newContactMessage.name}`, emailHtml);

        res.status(201).json({ message: 'Message received successfully!' });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ error: 'Server error while saving message.' });
    }
});

module.exports = router;
