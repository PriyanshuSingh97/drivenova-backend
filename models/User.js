// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls essential for unique index
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true, // Allows for multiple null documents
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // This creates a unique index on the email field
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: function() {
        // Only required if no OAuth IDs present for email/password users
        return !this.googleId && !this.githubId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
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
    isEmailVerified: {
      type: Boolean,
      default: function() {
        // Auto-verify if OAuth user, require verification for email/password users
        return !!(this.googleId || this.githubId);
      },
    },
    emailVerificationToken: {
      type: String,
      sparse: true,
    },
    passwordResetToken: {
      type: String,
      sparse: true,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
