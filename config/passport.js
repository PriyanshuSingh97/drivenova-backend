// config/passport.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Fail-fast if essential OAuth environment variables are missing
if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.BACKEND_URL
) {
  console.error(
    '❌ Google OAuth configuration error: Missing required environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL).'
  );
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
        if (!email) {
          return done(new Error('Google account did not return an email.'), null);
        }

        // User lookup logic
        // First, try to find by googleId. If not, try by email.
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email: email });
          if (user) {
            // User exists with this email, so link the Google account
            user.googleId = profile.id;
            user.profileImage = user.profileImage || profile.photos?.[0]?.value || '';
            await user.save();
          } else {
            // No user found, create a new one
            const username =
              profile.displayName ||
              email.split('@')[0] ||
              `googleuser_${profile.id}`;
            user = await User.create({
              googleId: profile.id,
              username,
              email,
              profileImage: profile.photos?.[0]?.value || '',
              role: 'user',
            });
          }
        }
        return done(null, user);
      } catch (err) {
        console.error('Error during Google OAuth:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
