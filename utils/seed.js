const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

// Connect to MongoDB
require('../database/mongoConfig');

const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

const NUM_USERS = 25;
const NUM_POSTS_PER_USER = 100;
const NUM_COMMENTS_PER_POST = 100;

const randomNum = (maxLength) =>
  faker.number.int({ min: 0, max: maxLength - 1 });

async function seedData() {
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});

  try {
    const users = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const user = new User({
        githubId: faker.string.uuid(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        profile: {
          displayName: faker.person.fullName(),
          avatar: faker.image.avatar(),
          bio: faker.person.bio(),
        },
        followers: [],
        following: [],
        followingRequests: [],
        posts: [],
      });

      console.log(user);
      user.password = await bcrypt.hash(user.password, 10);
      users.push(user);
    }

    await User.insertMany(users);
    console.log(`${NUM_USERS} users seeded successfully.`);

    for (let i = 0; i < users.length; i++) {
      const currentUser = users[i];
      const followers = [];
      const following = [];
      const followingRequests = [];

      for (let j = 0; j < NUM_USERS / 2; j++) {
        const randomFollower = users[randomNum(NUM_USERS)].id;
        followers.push(randomFollower);

        const followerIndex = users.findIndex(
          (user) => user.id === randomFollower,
        );
        if (followerIndex !== -1) {
          users[followerIndex].following.push(currentUser.id);
        }
      }

      for (let j = 0; j < NUM_USERS / 2; j++) {
        const randomFollowing = users[randomNum(NUM_USERS)].id;
        following.push(randomFollowing);

        const followingIndex = users.findIndex(
          (user) => user.id === randomFollowing,
        );
        if (followingIndex !== -1) {
          users[followingIndex].followers.push(currentUser.id);
        }
      }

      for (let j = 0; j < NUM_USERS / 2; j++) {
        followingRequests.push(users[randomNum(NUM_USERS)].id);
      }

      currentUser.followers = followers;
      currentUser.following = following;
      currentUser.followingRequests = followingRequests;

      await currentUser.save();
    }

    console.log(`User relationships seeded successfully.`);

    const posts = [];
    for (let i = 0; i < NUM_POSTS_PER_USER; i++) {
      const userIndex = randomNum(NUM_USERS);

      const post = new Post({
        author: users[userIndex].id,
        content: {
          ...(Math.random() < 0.5 && { media: faker.image.urlLoremFlickr() }),
          text: faker.lorem.paragraph(),
        },
        likes: [],
        comments: [],
      });

      for (let j = 0; j < NUM_USERS / 2; j++) {
        post.likes.push(users[randomNum(NUM_USERS)].id);
      }

      posts.push(post);
      users[userIndex].posts.push(post.id);
      await users[userIndex].save();
    }

    await Post.insertMany(posts);
    console.log(`${NUM_POSTS_PER_USER} posts seeded successfully.`);

    const comments = [];
    for (let i = 0; i < NUM_COMMENTS_PER_POST; i++) {
      const postIndex = randomNum(NUM_POSTS_PER_USER);

      const comment = new Comment({
        author: users[randomNum(NUM_USERS)].id,
        post: posts[postIndex].id,
        content: faker.lorem.sentence(),
        likes: [],
      });

      for (let j = 0; j < NUM_USERS / 2; j++) {
        comment.likes.push(users[randomNum(NUM_USERS)].id);
      }

      comments.push(comment);
      posts[postIndex].comments.push(comment.id);
      await posts[postIndex].save();
    }

    await Comment.insertMany(comments);
    console.log(`${NUM_COMMENTS_PER_POST} comments seeded successfully.`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
