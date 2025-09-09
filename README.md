# 🚗 DriveNova — Backend (API)
- This is the backend of the DriveNova project.  
- It powers the frontend by handling car data, user management, booking flows, media management, and secure authentication.

## 🌐 Live API
👉 [DriveNova Backend](https://drivenova-backend.onrender.com)

---

## ⚡ Features
- Authentication: Email/password, Google OAuth, GitHub OAuth
- Cars: CRUD with admin-only protection; Cloudinary cleanup on delete when `imagePublicId` exists
- Bookings: Authenticated creation; admin can list all bookings
- Contact: Store contact messages
- Session store: Mongo-backed session for Passport OAuth handshake; JWT used for API auth

---

## 🛠️ Tech Stack
- **Node.js + Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Passport.js (Google & GitHub OAuth)**
- **Cloudinary (image storage)**

---

## 📂 Project Structure
```plaintext
backend/
├── server.js                 # Entry point
├── db.js                     # Database connection
├── package.json              # Dependencies and scripts
│
├── config/
│   ├── passport.js           # OAuth strategies
│   └── cloudinary.js         # Cloudinary setup
│
├── middleware/
│   └── authMiddleware.js     # JWT authentication middleware
│
├── models/
│   ├── User.js               # User schema
│   ├── Car.js                # Car schema
│   ├── Booking.js            # Booking schema
│   └── Contact.js            # Contact schema
│
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── cars.js               # Car CRUD routes
│   ├── bookings.js           # Booking routes
│   └── contact.js            # Contact form routes
│
└── README.md                 # Project documentation
```

---

## 🔗 Frontend
This backend is used by the frontend hosted at:  
👉 [https://drivenova.onrender.com](https://drivenova.onrender.com)

---

## ⚠️ Important Notice
This project is **owned by me** and is uploaded to GitHub **only for portfolio and deployment purposes**.  
🚫 **Do not copy, redistribute, or claim this project as your own.**
