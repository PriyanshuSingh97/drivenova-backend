// routes/bookings.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // This points to your Booking model
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check for admin role
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Access is restricted to administrators.' });
  }
};

// POST /api/bookings - Save a new booking
router.post('/', async (req, res) => {
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
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const booking = new Booking({
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
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
