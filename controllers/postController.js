const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const upload = require('../middlewares/multer');
const getDataURI = require('../utils/getDataURI');
const getMediaId = require('../utils/getMediaId');
const authenticate = require('../auth/authenticate');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({}).sort({ createdAt: -1 }).populate({
    path: 'author',
    select: 'username profile',
  });

  if (posts.length <= 0) {
    res.sendStatus(404);
    return;
  }

  res.status(200).json({ posts });
});

exports.getPost = [
  param('postId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
    }

    const post = await Post.findById(req.params.postId).populate({
      path: 'author',
      select: 'username profile',
    });

    if (!post) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ post });
  }),
];

exports.postPost = [
  authenticate,

  upload.single('media'),

  body('text').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    let media;

    if (req.file) {
      const dataURI = getDataURI(req.file.buffer, req.file.mimetype);

      media = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
      });

      if (!media) {
        res.sendStatus(500);
        return;
      }
    }

    if (!media && !req.body.text) {
      res.sendStatus(400);
      return;
    }

    const post = new Post({
      author: req.user.id,
      content: {
        ...(media && { media: media.secure_url }),
        ...(req.body.text && { text: req.body.text }),
      },
    });

    await User.findByIdAndUpdate(req.user.id, { $push: { posts: post.id } });
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
      author: req.user.username,
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

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const post = await Post.findOneAndDelete({
        _id: req.params.postId,
        author: req.user.username,
      });

      if (!post) {
        const error = new Error('Forbidden');
        error.status = 403;
        throw error;
      }

      const mediaId = getMediaId(post.content.media);

      const media = await cloudinary.uploader.destroy(mediaId);

      if (!media) {
        const error = new Error('Internal Server Error');
        error.status = 500;
        throw error;
      }

      await session.commitTeansaction();
    } catch (err) {
      await session.abortTransaction();
      next(err);
      return;
    } finally {
      await session.endSession();
    }

    res.sendStatus(200);
  },
];

exports.getUserPosts = [
  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'author',
        select: 'username profile',
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profile',
        },
        options: {
          sort: { createdAt: -1 },
        },
      });

    if (posts.length <= 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ posts });
  }),
];

exports.postLikeToPost = [
  authenticate,

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

    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.status(200).json({ post });
  }),
];

exports.getComments = [
  authenticate,

  param('postId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'author',
        select: 'username profile',
      });

    if (comments.length <= 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ comments });
  }),
];

exports.postComment = [
  authenticate,

  param('postId').trim().notEmpty().escape(),

  body('text').trim().notEmpty().escape(),

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

    const comment = new Comment({
      author: req.user.id,
      post: req.params.postId,
      content: req.body.text,
    });

    post.comments.push(comment.id);

    await comment.save();
    await comment.populate({
      path: 'author',
      select: 'username profile',
    });
    await post.save();
    res.status(200).json({ comment });
  }),
];

exports.postLikeToComment = [
  authenticate,

  param('commentId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({ errors: errors.array() });
      return;
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      res.sendStatus(404);
      return;
    }

    if (comment.likes.includes(req.user.id)) {
      comment.likes.pull(req.user.id);
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();
    res.status(200).json({ comment });
  }),
];
