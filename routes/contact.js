// routes/contact.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact - Save a new contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, message, phone } = req.body;
        if (!name || !email || !message || !phone) {
            return res.status(400).json({ error: 'All fields are required.' });
        } 

        const newContactMessage = new Contact({ name, email, phone, message });
        await newContactMessage.save();
        res.status(201).json({ message: 'Message received successfully!' });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ error: 'Server error while saving message.' });
    }
});

module.exports = router;
