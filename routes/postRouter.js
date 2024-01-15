const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

router.get('/post/:postId', postController.getPost);

router.post('/post', postController.postCreateNewPost);

router.patch('/post/:postId', postController.patchPost);

router.delete('/post/:postId', postController.deletePost);

module.exports = router;
