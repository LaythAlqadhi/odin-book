const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/user/:userId/follow-request', userController.postUserFollowRequest);

router.post('/user/:userId/follow-respond/:status', userController.postUserFollowRespond);

module.exports = router;
