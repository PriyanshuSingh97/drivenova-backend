// db.js
const mongoose = require('mongoose');

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    // Log a success message if the connection is successful
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // Log an error and exit the process if the connection fails
    console.error(`❌ Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
