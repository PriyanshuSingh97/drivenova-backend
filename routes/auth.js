// routes/auth.js

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware

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
    session: false // We are using JWT, so session is not needed after this point
  }),
  (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set in environment variables');
      }
      
      // ✅ FIXED: Include the user's role in the JWT payload.
      const payload = { 
        id: req.user._id, 
        email: req.user.email,
        role: req.user.role 
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      // Redirect to frontend with token as query parameter
      const frontendUrl = process.env.FRONTEND_URL || 'https://drivenova.onrender.com';
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (err) {
      console.error('Error generating JWT:', err);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5500'}?error=auth_failed`);
    }
  }
);

// ✅ FIXED: Protected this route with JWT middleware.
// It now checks for a valid token and returns user info.
router.get('/me', authMiddleware, (req, res) => {
  // authMiddleware has already verified the token and attached user data to req.user
  res.json({ user: req.user });
});

module.exports = router;