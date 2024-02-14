const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

router.get('/posts', postController.getPosts);

router.post('/posts', postController.postPost);

router.get('/posts/:postId', postController.getPost);

router.patch('/posts/:postId', postController.patchPost);

router.delete('/posts/:postId', postController.deletePost);

router.get('/users/:userId/posts', postController.getUserPosts);

router.get('/posts/:postId/comments', postController.getComments);

router.post('/posts/:postId/comments', postController.postComment);

router.post('/posts/:postId/like', postController.postLikeToPost);

router.post('/comments/:commentId/like', postController.postLikeToComment);

module.exports = router;
