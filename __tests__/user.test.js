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

beforeAll(async () => {
  await initializeMongoServer();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /users/signup', () => {
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
      .post('/users/signup')
      .send(mockUserData);

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeFalsy();
  });

  it('retrives errors if any of the inputs is invalid', async () => {
    // Modify firstName for an invalid request
    mockUserData.firstName = '';
    
    const res = await request(app)
      .post('/users/signup')
      .send(mockUserData);
    
    expect(res.body.errors).toBeTruthy();
  });
});
