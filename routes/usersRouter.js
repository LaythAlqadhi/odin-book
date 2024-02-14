const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/users/search', userController.getSearch);

router.get('/users/:userId/followers', userController.getUserFollowers);

router.get('/users/:userId/following', userController.getUserFollowing);

router.get(
  '/users/:userId/follow-requests',
  userController.getUserFollowRequests,
);

router.get('/users/:userId', userController.getUser);

router.get('/users', userController.getUsers);

router.post('/users/:userId/follow-request', userController.postFollowRequest);

router.post(
  '/users/:userId/follow-respond/:status',
  userController.postFollowRespond,
);

router.delete(
  '/users/:userId/follow-request',
  userController.deleteFollowRequest,
);

router.delete(
  '/users/:followingUserId/following/:followerUserId',
  userController.deleteUserFollowing,
);

module.exports = router;
