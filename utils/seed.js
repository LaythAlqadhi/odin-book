const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

// Connect to MongoDB
require('./database/mongoConfig');

const User = require('./models/user');
const Post = require('./models/post');

const NUM_USERS = 20;
const NUM_POSTS_PER_USER = 5;
const NUM_COMMENTS_PER_POST = 3;

async function seedData() {
  await User.deleteMany({});
  await Post.deleteMany({});
  
  const users = [];

  for (let i = 0; i < NUM_USERS; i++) {
    const user = new User({
      githubId: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        avatar: faker.image.avatar(),
      },
    });

    users.push(user);
  }

  try {
    await User.insertMany(users);
    console.log(`${NUM_USERS} users seeded successfully.`);

    for (const user of users) {
      const posts = [];

      for (let i = 0; i < NUM_POSTS_PER_USER; i++) {
        const post = new Post({
          author: user._id,
          content: faker.lorem.paragraph(),
          likes: faker.number.int({ min: 0, max: 2000 }),
        });

        const comments = [];
        for (let j = 0; j < NUM_COMMENTS_PER_POST; j++) {
          const comment = {
            author: new mongoose.Types.ObjectId(users[faker.number.int({ min: 0, max: NUM_USERS - 1 })]['_id']),
            post: new mongoose.Types.ObjectId(users[faker.number.int({ min: 0, max: users.length - 1 })]['_id']),
            content: faker.lorem.sentence(),
            likes: faker.number.int({ min: 0, max: 2000 }),
          };
          comments.push(comment);
        }

        post.comments = comments;
        posts.push(post);
      }

      await Post.insertMany(posts);
    }

    console.log(`${NUM_POSTS_PER_USER * NUM_USERS} posts seeded successfully.`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Call the function to seed users and posts
seedData();
