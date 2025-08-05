// routes/auth.js

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Start Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set in environment variables');
      }
      // Generate JWT token for authenticated user
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email }, // Add `role: req.user.role` if needed
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      // Redirect to frontend with token as query parameter
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (err) {
      console.error('Error generating JWT:', err);
      res.status(500).send('Authentication failed');
    }
  }
);

// Route to check user authentication (returns user info if logged in)
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

module.exports = router;
