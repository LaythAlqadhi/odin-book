const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../models/user');

exports.postAuthSignUp = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name must not be not empty.')
    .isLength({ max: 25 })
    .withMessage('Name must not be greater than 25 characters.')
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
        displayName: req.body.name,
      },
    });

    await user.save();
    res.status(200).json({ user });
  }),
];

exports.postAuthSignIn = [
  body('username').trim().notEmpty().escape(),

  body('password').trim().notEmpty().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
     }

    next();
  },

  passport.authenticate('local', { session: false }),
  (req, res) => {
    const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '6h',
    });

    const user = {
      id: req.user.id,
      username: req.user.username,
      profile: req.user.profile,
    };

    const payload = { token, user };
    res.status(200).json({ payload });
  },
];

exports.getAuthDemo = [
  (req, res, next) => {
    req.body.username = 'Leo79';
    req.body.password = 'DDpDzYJaaRdOvyC';

    next();
  },

  passport.authenticate('local', { session: false }),
  (req, res) => {
    const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '6h',
    });

    const user = {
      id: req.user.id,
      username: req.user.username,
      profile: req.user.profile,
    };

    const payload = { token, user };

    res.status(200).json({ payload });
  },
];

exports.getAuthGithub = passport.authenticate('github');

exports.getAuthGithubCB = [
  passport.authenticate('github', {
    session: false,
    failureRedirect: process.env.CLIENT_URL,
  }),

  (req, res) => {
    const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '6h',
    });
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}&id=${req.user.id}&username=${req.user.username}&avatar=${req.user.profile.avatar}`);
  },
];
