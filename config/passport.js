// config/passport.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || ''}/api/auth/google/callback`
    },
    // This function runs on Google callback
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Ensure username and email is always present (required in schema)
          const username =
            profile.displayName ||
            (profile.emails && profile.emails[0] && profile.emails[0].value.split('@')[0]) ||
            `googleuser_${profile.id}`;
          const email = profile.emails && profile.emails[0] && profile.emails[0].value
            ? profile.emails[0].value
            : undefined;

          // Don't create user if Google didn't supply an email
          if (!email) {
            return done(new Error("Google account did not return an email."), null);
          }

          user = await User.create({
            googleId: profile.id,
            username,
            email,
            profileImage: profile.photos?.[0]?.value || '',
            role: 'user'
          });
        }
        return done(null, user);
      } catch (err) {
        console.error('Error during Google OAuth:', err);
        return done(err, null);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
