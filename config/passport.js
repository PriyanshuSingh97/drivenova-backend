// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Environment Variable Validation
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.BACKEND_URL) {
  console.error('❌ Google OAuth configuration error: Missing required environment variables.');
  process.exit(1);
}

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.error('❌ GitHub OAuth configuration error: Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET.');
  process.exit(1);
}

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
        if (!email) {
          return done(new Error('Google account did not return an email.'), null);
        }

        // User lookup logic
        // First try to find by googleId. If not try by email
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email: email });
          if (user) {
            // User exists with this email so link the Google account
            user.googleId = profile.id;
            user.profileImage = user.profileImage || profile.photos?.[0]?.value || '';
            await user.save();
          } else {
            // No user found create a new one
            const username = profile.displayName || email.split('@')[0] || `googleuser_${profile.id}`;
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

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
          return done(new Error('GitHub account did not return a public email.'), null);
        }

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = await User.findOne({ email: email });
          if (user) {
            // User exists with this email so link the GitHub account
            user.githubId = profile.id;
            user.profileImage = user.profileImage || profile._json.avatar_url || '';
            await user.save();
          } else {
            // Create new user 
            user = await User.create({
              githubId: profile.id,
              username: profile.username || profile.displayName || email.split('@')[0],
              email: email,
              profileImage: profile._json.avatar_url || '',
              role: 'user', 
            });
          }
        }

        return done(null, user);
      } catch (err) {
        console.error('Error during GitHub OAuth:', err);
        return done(err, null);
      }
    }
  )
);

// Serialization / Deserialization
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
