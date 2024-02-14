const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const { ExtractJwt } = require('passport-jwt');

const User = require('../models/user');

// JWT strategy configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// Passport configuration
passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.sub);

      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }),
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

const githubOptions = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GUTHUB_CALLBACK_URL,
};

passport.use(
  new GitHubStrategy(
    githubOptions,
    async (accessToken, refreshToken, profile, done) => {
      try {
        const defaultUser = {
          githubId: profile.id,
          username: profile.username,
          ...(profile?._json.email && { email: profile._json.email }),
          profile: {
            ...(profile?.displayName && { displayName: profile.displayName }),
            ...(profile?.photos[0].value && { avatar: profile.photos[0].value }),
            ...(profile?._json.bio && { bio: profile._json.bio }),
          },
        };

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = await User.create(defaultUser);
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);

module.exports = passport;
