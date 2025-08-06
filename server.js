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
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB Atlas
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://127.0.0.1:5509',
  'http://localhost:5500',
  'https://admin-drivenova.netlify.app',
  process.env.FRONTEND_URL,
  'https://drivenova.onrender.com',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl)
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

// ✅ Session middleware (for Google OAuth with Passport, but we use JWT everywhere else)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a-very-strong-and-long-random-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }
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
