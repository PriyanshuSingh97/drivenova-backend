// routes/bookings.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
    try {
        const bookingData = req.body;

        // Basic validation
        if (!bookingData.name || !bookingData.email || !bookingData.car_model) {
            return res.status(400).json({ error: 'Missing required booking information.' });
        }

        const newBooking = new Booking(bookingData);
        await newBooking.save();

        res.status(201).json({ message: 'Booking created successfully!', booking: newBooking });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Server error while creating booking.' });
    }
});

module.exports = router;