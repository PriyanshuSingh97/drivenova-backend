// routes/cars.js

const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Multer setup (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all cars (with filters and search)
router.get('/', async (req, res) => {
  try {
    const { category, maxPrice, minPrice, name } = req.query;
    let filter = {};
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseInt(maxPrice) };
    if (minPrice) filter.price = { ...filter.price, $gte: parseInt(minPrice) };
    if (name) filter.name = { $regex: name, $options: 'i' };
    const cars = await Car.find(filter);
    res.json({ data: cars });
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// POST add new car (Admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    const { name, plate, price, features, category } = req.body;

    if (!name || !plate || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields (name, plate, price, category)' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'cars' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const carFeatures = Array.isArray(features)
      ? features
      : features
      ? features.split(',').map(f => f.trim()).filter(Boolean)
      : [];

    const newCar = new Car({
      name,
      plate,
      price,
      features: carFeatures,
      image: uploadResult.secure_url,
      category,
      imagePublicId: uploadResult.public_id // Store for easier deletion later
    });

    const savedCar = await newCar.save();
    res.status(201).json(savedCar);

  } catch (err) {
    console.error('Error adding new car:', err);
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
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const updateData = { ...req.body };

    // Properly handle features
    if (updateData.features) {
      updateData.features = Array.isArray(updateData.features)
        ? updateData.features
        : updateData.features.split(',').map(f => f.trim()).filter(Boolean);
    }

    // Upload new image if provided
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'cars' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      updateData.image = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    // Delete image from Cloudinary using stored public_id
    if (car.imagePublicId) {
      await cloudinary.uploader.destroy(car.imagePublicId);
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });

  } catch (err) {
    console.error('Error deleting car:', err);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

module.exports = router;
