// routes/auth.js

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Start Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5500'}?error=auth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set in environment variables');
      }
      const payload = {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      const frontendUrl = process.env.FRONTEND_URL || 'https://drivenova.onrender.com';
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (err) {
      console.error('Error generating JWT:', err);
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5500'}?error=auth_failed`
      );
    }
  }
);

// Protected: Return user data if JWT is valid
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
