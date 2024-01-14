const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/user/signup', userController.user_signup_post);

router.post('/user/signin', userController.user_signin_post);

router.post('/user/:userId', userController.user_follow_request_post);

module.exports = router;
