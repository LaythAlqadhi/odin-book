const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/user/signup', userController.postUserSignUp);

router.post('/user/signin', userController.postUserSignIn);

router.post('/user/:userId/follow-request', userController.postUserFollowRequest);

router.post('/user/:userId/follow-response', userController.postUserFollowResponse);

module.exports = router;
