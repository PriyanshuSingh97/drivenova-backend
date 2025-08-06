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
// ✅ FIXED: Added your production frontend URL to the list of allowed origins.
const allowedOrigins = [
  'http://127.0.0.1:5509',                // Local development (Live Server for admin tool)
  'http://localhost:5500',                // Alternate local dev port
  'https://admin-drivenova.netlify.app/',  // Deployed admin tool
  process.env.FRONTEND_URL,               // Environment variable for production URL
  'https://drivenova.onrender.com'        // Production Frontend URL
].filter(Boolean); // Filter out undefined/null values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy does not allow access from this origin.'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);


// ✅ Session middleware (needed for Passport.js)
app.use(
  session({
    // It's highly recommended to use a long, random string for the secret in production.
    secret: process.env.SESSION_SECRET || 'a-very-strong-and-long-random-secret-key',
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