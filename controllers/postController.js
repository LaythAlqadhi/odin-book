const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');

const authenticate = require('../auth/authenticate');
const User = require('../models/user');
const Post = require('../models/post');

exports.postCreateNewPost = [
  authenticate,
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content must not be empty.')
    .isLength({ max: 2500 })
    .withMessage('Content must not be greater than 2500 characters.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
    }

    const post = new Post({
      author: req.user.id,
      content: req.body.content,
    });

    await post.save();
    res.status(200).json(post);
  }),
];
