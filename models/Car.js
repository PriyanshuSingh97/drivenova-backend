// models/Car.js

const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true
    },
    // ✅ FIXED: Added brand field to match the frontend form
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    plate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    // ✅ FIXED: Renamed 'price' to 'pricePerDay' to match frontend
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price must be positive']
    },
    features: {
      type: [String],
      default: []
    },
    // ✅ FIXED: Renamed 'image' to 'imageUrl' to match frontend
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: {
        validator: (v) => /^https?:\/\/.+/.test(v),
        message: 'Image must be a valid URL'
      }
    },
    // ✅ FIXED: This field is no longer relevant to the new workflow
    // but kept as optional in case you store public IDs manually.
    imagePublicId: {
      type: String,
      required: false
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      // ✅ FIXED: Changed to lowercase to match frontend filters
      enum: ['sedan', 'suv', 'luxury', 'electric', 'truck', 'other']
    }
  },
  { timestamps: true }
);

// Index for faster searching by name and category
carSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Car', carSchema);