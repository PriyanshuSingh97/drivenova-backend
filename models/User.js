// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls, essential for unique index
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    profileImage: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          // Allow empty string or a valid URL
          return v === '' || /^https?:\/\/.+/.test(v);
        },
        message: 'Profile image must be a valid URL',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// For performance on queries by email
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
