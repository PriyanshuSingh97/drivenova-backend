// server.js 

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const connectDB = require('./db');
const carRoutes = require('./routes/cars');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const contactRoutes = require('./routes/contact');

require('./config/passport'); // Initialize passport configuration

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB Atlas
connectDB();

// ✅ Trust the reverse proxy (important for Render/Heroku)
app.set('trust proxy', 1);

// ✅ Middleware for JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:5501',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
  
].filter(Boolean);

// ✅ Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

// ✅ Express-session with MongoStore for production
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'drive-nova-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions', // Name of the collection to store sessions
      ttl: 14 * 24 * 60 * 60 // Session time to live in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  })
);

// ✅ Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// ✅ API Routes
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ DriveNova backend is running!' });
});

// Handle 404 Not Found errors
app.use((req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.stack);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
