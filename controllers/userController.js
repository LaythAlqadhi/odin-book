const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authenticate = require('../auth/authenticate');
const User = require('../models/user');

exports.postUserFollowRequest = [
  authenticate,
  
  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      res.sendStatus(404);
      return;
    } else if (req.params.userId === req.user.id) {
      res.sendStatus(403);
      return;
    } else if (user.followingRequests.includes(req.user.id)) {
      res.sendStatus(400);
      return;
    }

    user.followingRequests.push(req.user.id);
    await user.save();
    res.sendStatus(200);
  }),
];

exports.postUserFollowRespond = [
  authenticate,

  param('userId').trim().notEmpty().escape(),
  param('status').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const followRequester = await User.findById(req.params.userId);
    if (!followRequester) {
      res.sendStatus(404);
      return;
    } else if (req.params.userId === req.user.id) {
      res.sendStatus(403);
      return;
    };

    const followResponder = await User.findOne({
      _id: req.user.id,
      followingRequests: { $in: [req.params.userId] },
    });

    if (!followResponder) {
      res.sendStatus(404);
      return;
    }

    if (req.params.status === 'accepted') {
        followRequester.following.push(req.user.id);
      followResponder.followers.push(req.params.userId);
      followResponder.followingRequests.pull(req.params.userId);
    } else {
      followResponder.followingRequests.pull(req.params.userId);
    }
    
    await followRequester.save();
    await followResponder.save();
    res.sendStatus(200);
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

    const user = await User.findById(req.params.userId);

    if (!user) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ user });
  }),
];

exports.getUserFollowers = [
  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const users = await User
      .findById(req.params.userId)
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

    const users = await User
      .findById(req.params.userId)
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

exports.getUserFollowingRequests = [
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
    
    const users = await User
      .findById(req.user.id)
      .select('followingRequests')
      .populate({
        path: 'followingRequests',
        select: 'username profile',
      });

    if (users.length <= 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ users });
  }),
];

exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  if (users.length <= 0) {
    res.sendStatus(404);
    return;
  }

  res.status(200).json({ users });
});
