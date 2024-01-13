const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/users/signup', userController.user_signup_post);

router.post('/users/signin', userController.user_signin_post);

module.exports = router;
