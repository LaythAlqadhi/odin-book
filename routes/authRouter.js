const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/auth/signup', authController.postAuthSignUp);

router.post('/auth/signin', authController.postAuthSignIn);

//router.post('/auth/github', authController.postAuthGithub);

//router.post('/auth/github/callback', authController.postAuthGithubCB);

module.exports = router;
