const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');

const initializeMongoServer = require('../database/mongoConfigTesting');
const passport = require('../auth/passportConfig');
const userRouter = require('../routes/userRouter');
const postRouter = require('../routes/postRouter');

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', userRouter);
app.use('/', postRouter);

let token1;
let token2;
let userId1;
let userId2;

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
    .post('/user/signup')
    .send(mockUser1Data);
  const signup2 = await request(app)
    .post('/user/signup')
    .send(mockUser2Data);

  userId1 = signup1.body.id;
  userId2 = signup2.body.id;

  const signin1 = await request(app)
    .post('/user/signin')
    .send(mockUser1Data);
  const signin2 = await request(app)
    .post('/user/signin')
    .send(mockUser2Data);

  token1 = signin1.body;
  token2 = signin2.body;
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
