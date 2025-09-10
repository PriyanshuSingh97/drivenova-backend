// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');
const { sendNotificationEmail } = require('../utils/email');

// Middleware to check for admin role
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Access is restricted to administrators.' });
    }
};

// POST /api/bookings - Save a new booking (SECURED)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            car_model,
            pickup_date,
            dropoff_date,
            pickup_location,
            dropoff_location,
            services,
            total_amount
        } = req.body;

        if (
            !name || !email || !phone || !car_model ||
            !pickup_date || !dropoff_date ||
            !pickup_location || !dropoff_location || !total_amount
        ) {
            return res.status(400).json({ error: 'All required fields must be provided.' });
        }

        const booking = new Booking({
            user: req.user.id,
            name,
            email,
            phone,
            car_model,
            pickup_date,
            dropoff_date,
            pickup_location,
            dropoff_location,
            services: Array.isArray(services) ? services : [],
            total_amount: Number(total_amount)
        });

        await booking.save();

        // Send Notification Email
        const emailHtml = `
            <h2>🚗 New Car Booking on DriveNova</h2>
            <p>A new car booking has been made with the following details:</p>
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 10px;"><strong>Name:</strong> ${booking.name}</li>
                <li style="margin-bottom: 10px;"><strong>Email:</strong> ${booking.email}</li>
                <li style="margin-bottom: 10px;"><strong>Phone:</strong> ${booking.phone}</li>
                <li style="margin-bottom: 10px;"><strong>Car Model:</strong> ${booking.car_model}</li>
                <li style="margin-bottom: 10px;"><strong>Pickup:</strong> ${new Date(booking.pickup_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} at ${booking.pickup_location}</li>
                <li style="margin-bottom: 10px;"><strong>Drop-off:</strong> ${new Date(booking.dropoff_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} at ${booking.dropoff_location}</li>
                <li style="margin-bottom: 10px;"><strong>Total Amount:</strong> ₹${booking.total_amount.toLocaleString('en-IN')}</li>
                <li style="margin-bottom: 10px;"><strong>Additional Services:</strong> ${booking.services.length > 0 ? booking.services.join(', ') : 'None'}</li>
            </ul>
        `;
        sendNotificationEmail(`New Booking: ${booking.car_model} by ${booking.name}`, emailHtml);

        res.status(201).json({ message: 'Booking created successfully!' });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ error: 'Server error while saving booking.' });
    }
});

// GET all bookings (for admin) - SECURED
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

module.exports = router;
