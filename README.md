# DriveNova Backend

- This is the backend of the *DriveNova* project.  
- It powers the frontend by handling car data, user management, booking flows, media management, and secure authentication.

## Live API
👉 [DriveNova Backend](https://drivenova-backend.onrender.com)

## Features
- Auth: Email/password, Google OAuth, GitHub OAuth; backend issues JWT for frontend consumption.
- Car listing management
- Cars: CRUD with admin-only protection; Cloudinary cleanup on delete when imagePublicId exists.
- Bookings: Authenticated creation; admin can list all bookings.
- Contact: Store contact messages.
- Session store: Mongo-backed session for Passport OAuth handshake; JWT used for API auth.

##Project Structure
server.js — app bootstrap: DB connect, sessions, CORS, routes, error handling.
db.js — MongoDB connection helper.
config/passport.js — Google/GitHub strategies, user linking by email, session serialization.
config/cloudinary.js — Cloudinary credentials/config.
middleware/authMiddleware.js — Bearer token verification for protected routes.
models/ — User, Car, Booking, Contact schemas with indexes and validation.
routes/
/api/auth — register/login, OAuth routes, /me.
/api/cars — list, get, create, update, delete (admin only on mutations).
/api/bookings — create (auth), list all (admin).
/api/contact — submit message.

## Important Note
- This backend repository works together with the DriveNova Frontend.  
- The source code is specifically tailored for this project and is *not intended for reuse or redistribution*.

## Related Repository
- [DriveNova Frontend](https://drivenova.onrender.com)
