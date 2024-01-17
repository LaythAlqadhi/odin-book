const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');

const authenticate = require('../auth/authenticate');
const Post = require('../models/post');

exports.getPost = [
  param('postId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ post });
  }),
];

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
    res.status(200).json({ post });
  }),
];

exports.patchPost = [
  authenticate,

  param('postId').trim().notEmpty().escape(),

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

    const post = await Post.findOne({
      _id: req.params.postId,
      author: req.user.id,
    });

    if (!post) {
      res.sendStatus(403);
      return;
    }

    post.content = req.body.content;
    await post.save();
    res.status(200).json({ post });
  }),
];

exports.deletePost = [
  authenticate,

  param('postId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
    }

    const post = await Post.findOneAndDelete({
      _id: req.params.postId,
      author: req.user.id,
    });

    if (!post) {
      res.sendStatus(403);
      return;
    }

    res.sendStatus(200);
  }),
];

exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find();

  if (posts.length <= 0) {
    res.sendStatus(404);
    return;
  }

  res.status(200).json({ posts });
})
