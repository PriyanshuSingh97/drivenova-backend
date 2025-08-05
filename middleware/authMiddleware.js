// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // ✅ Check for token in Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1]; // Extract token
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ Attach user data to request (ensure role always exists)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user' // Default role is 'user'
    };
    next();
  } catch (err) {
    console.error('❌ JWT Verification Error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = authMiddleware;
