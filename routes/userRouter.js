const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/user/:userId/follow-request', userController.postUserFollowRequest);

router.post('/user/:userId/follow-respond/:status', userController.postUserFollowRespond);

router.get('/user/:userId', userController.getUser);

router.get('/user/:userId/followers', userController.getUserFollowers);

router.get('/user/:userId/following', userController.getUserFollowing);

router.get('/user/:userId/followingRequests', userController.getUserFollowingRequests);

router.get('/users', userController.getUsers);


module.exports = router;
