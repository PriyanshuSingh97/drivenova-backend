// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, required: [true, 'Username is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    profileImage: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          return v === '' || /^https?:\/\/.+/.test(v);
        },
        message: 'Profile image must be a valid URL'
      }
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);

