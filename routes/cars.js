// routes/cars.js

const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const authMiddleware = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');

// Middleware to check for admin role (can be moved to a shared file later)
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Access is restricted to administrators.' });
  }
};

// GET all cars with filtering
router.get('/', async (req, res) => {
  try {
    const { category, maxPrice, minPrice, name } = req.query;
    let filter = {};
    if (category) filter.category = { $regex: `^${category}$`, $options: 'i' };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (maxPrice || minPrice) {
      filter.pricePerDay = {};
      if (maxPrice) filter.pricePerDay.$lte = parseInt(maxPrice);
      if (minPrice) filter.pricePerDay.$gte = parseInt(minPrice);
    }
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// POST a new car (SECURED - ADMIN ONLY)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, brand, plate, pricePerDay, features, category, imageUrl, imagePublicId } = req.body;
    if (!name || !brand || !plate || !pricePerDay || !category || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const newCar = new Car({ name, brand, plate, pricePerDay: parseInt(pricePerDay), features: Array.isArray(features) ? features : [], category, imageUrl, imagePublicId: imagePublicId || null });
    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (err) {
    console.error('Error adding new car:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A car with this license plate already exists.' });
    } // <<< FIX: Added the missing closing brace here.
    res.status(500).json({ error: 'Failed to add new car' });
  }
});

// GET a single car by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    console.error('Error fetching car by ID:', err);
    res.status(500).json({ error: 'Failed to fetch car' });
  }
});

// PUT (update) a car by ID (SECURED - ADMIN ONLY)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.pricePerDay) {
      update.pricePerDay = parseInt(update.pricePerDay);
    }
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!updatedCar) return res.status(404).json({ error: 'Car not found' });
    res.json(updatedCar);
  } catch (err) {
    console.error('Error updating car:', err);
    res.status(500).json({ error: 'Failed to update car' });
  }
});

// DELETE car by ID (SECURED - ADMIN ONLY)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    if (car.imagePublicId) {
      await cloudinary.uploader.destroy(car.imagePublicId);
    }
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car and associated image deleted successfully' });
  } catch (err) {
    console.error('Error deleting car:', err);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

module.exports = router;
