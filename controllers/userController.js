const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { param, query, validationResult } = require('express-validator');

const authenticate = require('../auth/authenticate');
const User = require('../models/user');

exports.getUsers = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const users = await User.find();

    if (users.length <= 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ users });
  }),
];

exports.getUser = [
  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const user = await User.findById(req.params.userId, {
      email: 0,
      password: 0,
    });

    if (!user) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ user });
  }),
];

exports.getSearch = [
  authenticate,

  query('q').trim().escape(),

  asyncHandler(async (req, res, next) => {
    if (req.query.q === '') {
      res.status(200).json({ users: [] });
      return;
    }

    const regexPattern = new RegExp(req.query.q, 'i');
    const users = await User.find(
      {
        $or: [
          { username: { $regex: regexPattern } },
          { 'profile.displayName': { $regex: regexPattern } },
        ],
      },
      { email: 0, password: 0 },
    ).limit(25);

    res.status(200).json({ users });
  }),
];

exports.postFollowRequest = [
  authenticate,

  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    if (req.params.userId === req.user.id) {
      res.sendStatus(403);
      return;
    }

    const user = await User.findOne(
      {
        _id: req.params.userId,
        followingRequests: { $nin: [req.user.id] },
      },
      { followingRequests: 1 },
    );

    if (!user) {
      res.sendStatus(404);
      return;
    }

    user.followingRequests.push(req.user.id);
    await user.save();
    res.status(200).json({ user });
  }),
];

exports.deleteFollowRequest = [
  authenticate,

  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    if (req.params.userId === req.user.id) {
      res.sendStatus(403);
      return;
    }

    const user = await User.findOne(
      {
        _id: req.params.userId,
        followingRequests: { $in: [req.user.id] },
      },
      { followingRequests: 1 },
    );

    if (!user) {
      res.sendStatus(404);
      return;
    }

    user.followingRequests.pull(req.user.id);
    await user.save();
    res.status(200).json({ user });
  }),
];

exports.postFollowRespond = [
  authenticate,

  param('userId').trim().notEmpty().escape(),
  param('status').trim().notEmpty().escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      if (req.params.userId === req.user.id) {
        const error = new Error('Forbidden');
        error.status = 403;
        throw error;
      }

      const followRequester = await User.findById(req.params.userId, {
        following: 1,
      });
      if (!followRequester) {
        const error = new Error('Not Found');
        error.status = 404;
        throw error;
      }

      const followResponder = await User.findOne(
        {
          _id: req.user.id,
          followingRequests: { $in: [req.params.userId] },
        },
        { followers: 1, followingRequests: 1 },
      );

      if (!followResponder) {
        const error = new Error('Not Found');
        error.status = 404;
        throw error;
      }

      if (req.params.status === 'confirmed') {
        followRequester.following.push(req.user.id);
        followResponder.followers.push(req.params.userId);
        followResponder.followingRequests.pull(req.params.userId);
      } else {
        followResponder.followingRequests.pull(req.params.userId);
      }

      await followRequester.save();
      await followResponder.save();
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

exports.getUserFollowers = [
  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const users = await User.findById(req.params.userId)
      .select('followers')
      .populate({
        path: 'followers',
        select: 'username profile',
      });

    if (users.length <= 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ users });
  }),
];

exports.getUserFollowing = [
  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const users = await User.findById(req.params.userId)
      .select('following')
      .populate({
        path: 'following',
        select: 'username profile',
      });

    if (users.length <= 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ users });
  }),
];

exports.deleteUserFollowing = [
  authenticate,
  param('followingUserId').trim().notEmpty().escape(),
  param('followerUserId').trim().notEmpty().escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      if (req.params.followerUserId !== req.user.id) {
        const error = new Error('Forbidden');
        error.status = 403;
        throw error;
      }

      const followerUser = await User.findOne(
        {
          _id: req.params.followerUserId,
          following: { $in: [req.params.followingUserId] },
        },
        { following: 1 },
      );

      if (!followerUser) {
        const error = new Error('Not Found');
        error.status = 404;
        throw error;
      }

      const followingUser = await User.findById(req.params.followingUserId, {
        followers: 1,
      });

      if (!followingUser) {
        const error = new Error('Not Found');
        error.status = 404;
        throw error;
      }

      followerUser.following.pull(req.params.followingUserId);
      followingUser.followers.pull(req.params.followerUserId);

      await followerUser.save();
      await followingUser.save();
      await session.commitTransaction();
      res.status(200).json({ followerUser, followingUser });
    } catch (err) {
      await session.abortTransaction();
      next(err);
      return;
    } finally {
      await session.endSession();
    }
  },
];

exports.getUserFollowRequests = [
  authenticate,

  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (req.user.id !== req.params.userId) {
      res.sendStatus(403);
      return;
    }

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const user = await User.findById(req.params.userId).populate({
      path: 'followingRequests',
      select: 'username profile',
    });

    if (user.length <= 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ user });
  }),
];
