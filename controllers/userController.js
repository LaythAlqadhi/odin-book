const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.user_signup_post = [
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
    res.status(200).json(user);
  }),
];

exports.user_signin_post = [
  body('username').trim().escape(),
  
  body('password').escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        res.json({
          errors: [
            {
              msg: 'Incorrect username',
              path: 'username',
              value: req.body.username,
            },
          ],
        });
        return;
      }

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        res.json({
          errors: [
            {
              msg: 'Incorrect password',
              path: 'password',
              value: req.body.password,
            },
          ],
        });
        return;
      }

      const payload = { sub: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '6h',
      });

      res.status(200).json(token);
    }
  }),
];
