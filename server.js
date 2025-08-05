// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./db');
const carRoutes = require('./routes/cars');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const contactRoutes = require('./routes/contact');
require('./config/passport'); // Google OAuth config

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB Atlas
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Configuration
const allowedOrigins = [
  'http://127.0.0.1:5509',                // Local development (Live Server)
  'http://localhost:3000',                // Local React (if applicable)
  'http://localhost:5000',                // Alternate local dev port
  'https://admin-drivenova.netlify.app',        // admin tool

  process.env.FRONTEND_URL || 'https://drivenova33.netlify.app', // Production (Netlify)
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`🔍 Incoming request origin: ${origin || 'Direct server call (no origin)'}`);
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked: ${origin}`);
        callback(new Error('CORS blocked: Not allowed by server.'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// ✅ Session middleware (needed for Passport.js)
app.use(
  session({
    secret: process.env.SESSION_SECRET || '8f2a7d1e2c9f4b76a1b38d6c7e5f90ab',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true only on HTTPS in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Fix cross-site cookies for OAuth
    },
  })
);

// ✅ Initialize Passport (Google OAuth)
app.use(passport.initialize());
app.use(passport.session());

// ✅ API Routes
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

// ✅ Health Check Endpoint
app.get('/', (req, res) => {
  res.json({ message: '✅ DriveNova backend is running!' });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
