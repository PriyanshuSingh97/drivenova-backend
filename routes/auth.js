// routes/auth.js

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

// Route to initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback after Google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}?error=auth_failed`,
    session: false, // We are using JWT, so no session is needed
  }),
  // This is the final handler that runs after successful authentication
  (req, res) => {
    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      // Ensure user object exists after authentication
      if (!req.user) {
        console.error('Authentication succeeded but req.user is missing.');
        return res.redirect(`${FRONTEND_URL}?error=user_not_found`);
      } // <<< FIX: Added the missing closing brace here.

      // Ensure JWT secret is configured on the server
      if (!JWT_SECRET) {
        console.error('JWT_SECRET not set in environment variables.');
        return res.redirect(`${FRONTEND_URL}?error=server_config_issue`);
      }

      // Create JWT payload
      const payload = {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      };

      // Sign the token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      // Safely append the token to the frontend URL
      const redirectUrl = new URL(FRONTEND_URL);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('user_id', req.user._id); // Optionally send user ID
      redirectUrl.searchParams.set('user_role', req.user.role); // Optionally send role for frontend logic

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Error during JWT generation or redirect:', error);
      res.redirect(`${FRONTEND_URL}?error=token_signing_failed`);
    }
  }
);

// Protected route to get user data if JWT is valid
router.get('/me', authMiddleware, (req, res) => {
  // authMiddleware attaches user info to req.user
  res.status(200).json({ user: req.user });
});

module.exports = router;
