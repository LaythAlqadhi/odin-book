const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

router.post('/post/:userId', postController.postCreateNewPost);

module.exports = router;
