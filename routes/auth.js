// routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

// Email/Password Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      isEmailVerified: false
    });

    // Generate JWT token
    const payload = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return res.status(401).json({ error: 'Please login using Google or GitHub.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback after Google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}?error=auth_failed`,
    session: false, // Using JWT, so no session is needed
  }),
  // This is the final handler that runs after successful authentication
  (req, res) => {
    try {
      const JWT_SECRET = process.env.JWT_SECRET;

      // Ensure user object exists after authentication
      if (!req.user) {
        console.error('Authentication succeeded but req.user is missing.');
        return res.redirect(`${FRONTEND_URL}?error=user_not_found`);
      }

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
      redirectUrl.searchParams.set('user_id', req.user._id);
      redirectUrl.searchParams.set('user_role', req.user.role);

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Error during JWT generation or redirect:', error);
      res.redirect(`${FRONTEND_URL}?error=token_signing_failed`);
    }
  }
);

// GitHub OAuth Routes
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${FRONTEND_URL}?error=auth_failed`,
    session: false,
  }),
  (req, res) => {
    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!req.user) {
        console.error('GitHub authentication succeeded but req.user is missing.');
        return res.redirect(`${FRONTEND_URL}?error=user_not_found`);
      }

      if (!JWT_SECRET) {
        console.error('JWT_SECRET not set in environment variables.');
        return res.redirect(`${FRONTEND_URL}?error=server_config_issue`);
      }

      const payload = {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      const redirectUrl = new URL(FRONTEND_URL);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('user_id', req.user._id);
      redirectUrl.searchParams.set('user_role', req.user.role);

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Error during GitHub JWT generation or redirect:', error);
      res.redirect(`${FRONTEND_URL}?error=token_signing_failed`);
    }
  }
);

// Protected Route
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
