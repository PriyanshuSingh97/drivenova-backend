// models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    plate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price must be positive'],
    },
    features: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: {
        validator: (v) => /^https?:\/\/.+/.test(v),
        message: 'Image must be a valid URL (starting with http or https)',
      },
    },
    imagePublicId: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['sedan', 'suv', 'luxury', 'electric', 'truck', 'other'],
    },

    //  Specs with enums for validation
    specs: {
      fuel: {
        type: String,
        trim: true,
        enum: ['petrol', 'diesel', 'electric', 'hybrid'],
        default: 'petrol',
      },
      transmission: {
        type: String,
        trim: true,
        enum: ['Manual', 'Automatic'],
        default: 'Manual',
      },
      seats: {
        type: Number,
        default: 5,
        min: [2, 'Car must have at least 2 seats'],
        max: [9, 'Car cannot have more than 9 seats'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Enable full-text search on name and improve category filtering performance
carSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Car', carSchema);
