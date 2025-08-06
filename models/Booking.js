// models/Booking.js

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  car_model: { type: String, required: true },
  pickup_date: { type: Date, required: true },
  dropoff_date: { type: Date, required: true },
  pickup_location: { type: String, required: true },
  dropoff_location: { type: String, required: true },
  services: { type: [String], default: [] },
  total_amount: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
