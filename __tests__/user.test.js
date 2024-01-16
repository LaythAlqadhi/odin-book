const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');

const initializeMongoServer = require('../database/mongoConfigTesting');
const passport = require('../auth/passportConfig');
const authRouter = require('../routes/authRouter');
const userRouter = require('../routes/userRouter');

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', authRouter);
app.use('/', userRouter);

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

  userId1 = signup1.body.id;
  userId2 = signup2.body.id;

  const signin1 = await request(app)
    .post('/auth/signin')
    .send(mockUser1Data);
  const signin2 = await request(app)
    .post('/auth/signin')
    .send(mockUser2Data);

  token1 = signin1.body;
  token2 = signin2.body;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /user/:userId/follow-request', () => {
  it('requests a follow to another user', async () => {
    const res = await request(app)
      .post(`/user/${userId2}/follow-request`)
      .auth(token1, { type: 'bearer' });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });

  it('rejects invalid request', async () => {
    const res1 = await request(app)
      .post(`/user/${userId2.slice(0, -2)}10/follow-request`)
      .auth(token1, { type: 'bearer' });

    expect(res1.status).toBe(404);
    expect(res1.body.errors).toBeFalsy();

    const res2 = await request(app)
      .post(`/user/${userId2}/follow-request`)
      .auth(`${token1.slice(0, -2)}10`, { type: 'bearer' });

    expect(res2.status).toBe(401);
    expect(res2.body.errors).toBeFalsy();
  });
});

describe('POST /user/:userId/follow-respond/:status', () => {
  it('respond to the follow request', async () => {
    const res = await request(app)
      .post(`/user/${userId1}/follow-respond/accepted`)
      .auth(token2, { type: 'bearer' });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });

  it('rejects the follow request if theres something wrong', async () => {
    // Set the user id the sane as the responder's
    const res = await request(app)
      .post(`/user/${userId2}/follow-respond/accepted`)
      .auth(token2, { type: 'bearer' });

    expect(res.status).toBe(403);
    expect(res.body.errors).toBeFalsy();
  });
});
