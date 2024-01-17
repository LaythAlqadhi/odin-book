const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');

const initializeMongoServer = require('../database/mongoConfigTesting');
const passport = require('../auth/passportConfig');
const authRouter = require('../routes/authRouter');
const postRouter = require('../routes/postRouter');

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', authRouter);
app.use('/', postRouter);

let token1;
let token2;
let userId1;
let userId2;
let postId;

beforeAll(async () => {
  await initializeMongoServer();

  const mockUser1Data = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    passwordConfirmation: 'SecurePass123!',
  };

  const mockUser2Data = {
    firstName: 'Sarah',
    lastName: 'Doe',
    username: 'SarahDoe',
    email: 'sarah.doe@example.com',
    password: 'SecurePass123!',
    passwordConfirmation: 'SecurePass123!',
  };

  const signup1 = await request(app)
    .post('/auth/signup')
    .send(mockUser1Data);
  const signup2 = await request(app)
    .post('/auth/signup')
    .send(mockUser2Data);

  userId1 = signup1.body.user.id;
  userId2 = signup2.body.user.id;

  const signin1 = await request(app)
    .post('/auth/signin')
    .send(mockUser1Data);
  const signin2 = await request(app)
    .post('/auth/signin')
    .send(mockUser2Data);

  token1 = signin1.body.token;
  token2 = signin2.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /post', () => {
  const mockPost = {
    content: 'mockContent',
  };
  
  it('creates a new post', async () => {
    const res = await request(app)
      .post('/post')
      .auth(token1, { type: 'bearer' })
      .send(mockPost);

    postId = res.body.post.id;

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });

  it('returns errors if the content is invalid', async () => {
    // Change the content to be invalid
    mockPost.content = '';
    
    const res = await request(app)
      .post('/post')
      .auth(token1, { type: 'bearer' })
      .send(mockPost);

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeTruthy();
  });
});

describe('GET /post/:postId', () => {
  it('gets a specific post correctly', async () => {
    const res = await request(app).get(`/post/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });
});

describe('Patch /post/:postId', () => {
  const mockEditedContent = {
    content: 'mockEditedContent',
  }
  
  it('edits a specific post correctly', async () => {
    const res = await request(app)
      .patch(`/post/${postId}`)
      .auth(token1, { type: 'bearer' })
      .send(mockEditedContent);

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
    
    expect(res.body.post.content).not.toBe('mockContent');
    expect(res.body.post.content).toBe('mockEditedContent');
  });
});

describe('Delete /post/:postId', () => {
  it('removes a specific post correctly', async () => {
    const res = await request(app)
      .delete(`/post/${postId}`)
      .auth(token1, { type: 'bearer' });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });

  it('will not remove the post if the request is not from the owner', async () => {
    // Changing the auth token to simulate a request from a different user
    const res = await request(app)
      .delete(`/post/${postId}`)
      .auth(token2, { type: 'bearer' });

    expect(res.status).toBe(403);
    expect(res.body.errors).toBeFalsy();
  });
});

describe('GET /posts', () => {
  it('gets a list of all posts correctly', async () => {
    const mockPost = {
      content: 'mockContent',
    };

    const newPost = await request(app)
      .post('/post')
      .auth(token1, { type: 'bearer' })
      .send(mockPost);

    postId = newPost.body.post.id;
    
    const res = await request(app).get('/posts');

    expect(res.status).toBe(200);
  });
  
  it('retrieves a status 404 if no posts found', async () => {
    const deletePost = await request(app)
    .delete(`/post/${postId}`)
    .auth(token1, { type: 'bearer' });
    
    const res = await request(app).get('/posts');

    expect(res.status).toBe(404);
  });
});
