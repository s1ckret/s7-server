import express from 'express';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';

import { User } from '../services/users-service.js'

const router = express.Router();

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, user.id);
  });
});

passport.deserializeUser(function (id, cb) {
  process.nextTick(async function () {
    try {
      const user = await User.get(id);
      cb(null, user);
    } catch (error) {
      cb(error);
    }
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/oauth2/redirect/google',
      scope: ['profile']
    },
    async function (issuer, profile, cb) {
      try {
        const user = await User.get(profile.id);
        if (user) {
          console.log(`User ${profile.id} logged in.`);
          return cb(null, user);
        } else {
          const newUser = await User.create({ id: profile.id });
          console.log(`New user ${profile.id} registered.`);
          return cb(null, newUser);
        }
      } catch (error) {
        console.error('DynamoDB error:', error);
        return cb(error);
      }
    }
  )
);

export default router;
