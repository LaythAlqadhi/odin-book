const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');

const initializeMongoServer = require('mongoConfigTesting');
const passport = require('../auth/passportConfig');
const userRouter = require('../routes/userRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

beforeAll(async () => {
  await initializeMongoServer():
});

afterAll(async () => {
  await mongoose.disconnect();
});
