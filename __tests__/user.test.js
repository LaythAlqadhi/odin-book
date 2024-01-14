const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');

const initializeMongoServer = require('../database/mongoConfigTesting');
const passport = require('../auth/passportConfig');
const userRouter = require('../routes/userRouter');

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', userRouter);

let token;
let userId1;
let userId2;

beforeAll(async () => {
  await initializeMongoServer();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /user/signup', () => {
  const mockUserData = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    passwordConfirmation: 'SecurePass123!',
  };
  
  it('creates a new user', async () => {
    const res = await request(app)
      .post('/user/signup')
      .send(mockUserData);

    // Save the user id for another test
    userId1 = res.body.id
    
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });

  it('retrives errors if any of the inputs is invalid', async () => {
    // Modify firstName for an invalid request
    mockUserData.firstName = '';
    
    const res = await request(app)
      .post('/user/signup')
      .send(mockUserData);
    
    expect(res.body.errors).toBeTruthy();
  });
});

describe('POST /user/signin', () => {
  const mockUserData = {
    username: 'JohnDoe',
    password: 'SecurePass123!',
  };

  it('signs in the user', async () => {
    const res = await request(app)
      .post('/user/signin')
      .send(mockUserData);

    // Save the token for another test
    token = res.body;

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });

  it('retrives errors if any of the inputs is invalid', async () => {
    // Modify username for an invalid request
    mockUserData.username = '';

    const res = await request(app)
      .post('/user/signin')
      .send(mockUserData);

    expect(res.body.errors).toBeTruthy();
  });
});

describe('POST /user/:userId', () => {
  it('requests a follow to another user', async () => {
    const mockUserData = {
      firstName: 'Sarah',
      lastName: 'Doe',
      username: 'SarahDoe',
      email: 'sarah.doe@example.com',
      password: 'SecurePass123!',
      passwordConfirmation: 'SecurePass123!',
    };
    
    // Create another user to send a request to
    const response = await request(app)
      .post('/user/signup')
      .send(mockUserData);

    userId2 = response.body.id;
    
    const res = await request(app)
      .post(`/user/${userId2}`)
      .auth(token, { type: 'bearer' });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });

  it('rejects invalid request', async () => {
    const res1 = await request(app)
      .post(`/user/${userId2.slice(0, -2)}10`)
      .auth(token, { type: 'bearer' });

    expect(res1.status).toBe(404);
    expect(res1.body.errors).toBeFalsy();

    const res2 = await request(app)
      .post(`/user/${userId2}`)
      .auth(`${token.slice(0, -2)}10`, { type: 'bearer' });

    expect(res2.status).toBe(401);
    expect(res2.body.errors).toBeFalsy();
  });
});
