// models/Car.js

const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true
    },
    plate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    features: {
      type: [String],
      default: []
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Image must be a valid URL'
      }
    },
    imagePublicId: {
      type: String,
      required: false
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Sedan', 'SUV', 'Luxury', 'Electric', 'Truck', 'Other']
    }
  },
  { timestamps: true }
);

// Index for faster searching by name and category
carSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Car', carSchema);
