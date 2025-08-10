// routes/auth.js

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route to initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback after Google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5500'}?error=auth_failed`,
    session: false,
  }),
  (req, res) => {
    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

      if (!JWT_SECRET) {
        console.error('JWT_SECRET not set in environment variables.');
        return res.redirect(`${FRONTEND_URL}?error=missing_jwt_secret`);
      }

      if (!req.user) {
        console.error('Authenticated but req.user is missing');
        return res.redirect(`${FRONTEND_URL}?error=user_not_found`);
      }

      const token = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Use URL constructor to append token safely
      const redirectUrl = new URL(FRONTEND_URL);
      redirectUrl.searchParams.set('token', token);

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Error during JWT generation:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5500'}?error=auth_failed`);
    }
  }
);

// Protected route to get user data if JWT is valid
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
