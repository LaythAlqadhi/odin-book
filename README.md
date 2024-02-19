# Odinbook Server Side
This this a social media web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) along with the Tailwind CSS framework for styling.
Check out the [client-side repo](https://github.com/LaythAlqadhi/odin-book-client-side).

## Preview
Check out the web application [Odinbook](odinbook-eight.vercel.app) to explore its features.

## Routers
- auth router
- users router
- posts router

## Models
- User
- Post
- Comment

## Features
- Designed using RESTful architectural style.
- Preventing unauthenticated users from accessing private routes.
- Using Cloudinary and Multer to upload images and videos with validations to prevent unknown file types and oversized files.
- Authenticating users using the Passport-GitHub2 strategy.
- Validating and sanitizing client data using Express-validator.
- Using sessions to ensure that all operations will either succeed or fail.
- Using Faker.js to create seeds.
