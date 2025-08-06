// routes/cars.js

const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const authMiddleware = require('../middleware/authMiddleware');
// Note: Multer and Cloudinary upload logic is removed as we are now accepting a URL.

// GET all cars (with filters and search)
router.get('/', async (req, res) => {
  try {
    const { category, maxPrice, minPrice, name } = req.query;
    let filter = {};
    if (category) filter.category = { $regex: `^${category}$`, $options: 'i' };
    if (maxPrice) filter.pricePerDay = { ...filter.pricePerDay, $lte: parseInt(maxPrice) };
    if (minPrice) filter.pricePerDay = { ...filter.pricePerDay, $gte: parseInt(minPrice) };
    if (name) filter.name = { $regex: name, $options: 'i' };
    
    const cars = await Car.find(filter);
    
    // ✅ FIXED: Return the array of cars directly, as the frontend expects.
    res.json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// POST add new car (Admin only)
// ✅ FIXED: Removed multer and changed logic to accept JSON with imageUrl.
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    // ✅ FIXED: Destructure all fields from req.body, including the new ones.
    const { name, brand, plate, pricePerDay, features, category, imageUrl } = req.body;

    if (!name || !brand || !plate || !pricePerDay || !category || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newCar = new Car({
      name,
      brand,
      plate,
      pricePerDay,
      features: Array.isArray(features) ? features : [],
      category,
      imageUrl,
    });

    const savedCar = await newCar.save();
    res.status(201).json(savedCar);

  } catch (err) {
    console.error('Error adding new car:', err);
    if (err.code === 11000) { // Handle duplicate plate error
        return res.status(400).json({ error: 'A car with this license plate already exists.' });
    }
    res.status(500).json({ error: 'Failed to add new car' });
  }
});

// GET car by ID
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

// PUT update car by ID (Admin only)
// ✅ FIXED: Removed multer to accept JSON data for updates.
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedCar) return res.status(404).json({ error: 'Car not found' });
    res.json(updatedCar);

  } catch (err) {
    console.error('Error updating car:', err);
    res.status(500).json({ error: 'Failed to update car' });
  }
});

// DELETE car by ID (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    
    // ✅ FIXED: Removed Cloudinary deletion logic as it's no longer applicable.
    // The image will now remain on Cloudinary, but the car is removed from the DB.

    res.json({ message: 'Car deleted successfully' });

  } catch (err) {
    console.error('Error deleting car:', err);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

module.exports = router;