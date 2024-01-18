const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const authenticate = require('../auth/authenticate');
const User = require('../models/user');

exports.postAuthSignUp = [
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('First Name must not be greater than 25 characters.')
    .escape(),

  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Last Name must not be greater than 25 characters.')
    .escape(),

  body('username')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Username must not be greater than 25 characters.')
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error('Username already in use.');
      }
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty.')
    .isEmail()
    .withMessage('Invalid email format.')
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Email already in use.');
      }
    }),

  body('password')
    .notEmpty()
    .withMessage('Password must not be empty.')
    .isStrongPassword()
    .withMessage('Password is not strong enough.')
    .escape(),

  body('passwordConfirmation')
    .notEmpty()
    .withMessage('Password Confirmation must not be empty.')
    .escape()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password does not match.'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
    }

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      profile: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      },
    });

    await user.save();
    res.status(200).json({ user });
  }),
];

exports.postAuthSignIn = [
  body('username').trim().notEmpty().escape(),
  
  body('password').notEmpty().escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
    }
    
    passport.authenticate('local', { session: false }, (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '6h' });

      return res.status(200).json({ token });
    })(req, res, next);
  },
];

exports.getAuthGithub = passport.authenticate('github', { scope: [ 'user:email' ] });

exports.getAuthGithubCB = (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '6h' });

    return res.status(200).json({ token });
  })(req, res, next);
};
