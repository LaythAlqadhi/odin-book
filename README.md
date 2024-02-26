# Odinbook Server Side
This this a social media web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) along with the Tailwind CSS framework for styling.
Check out the [client-side repo](https://github.com/LaythAlqadhi/odin-book-client-side).

## Preview
Check out the web application [Odinbook](https://odinbook-eight.vercel.app) to explore its features.

## Routers
- Index router
- Auth router
- Users router
- Posts router

## Models
- User
- Post
- Comment

## Features
- Implemented RESTful architectural style for streamlined communication.
- Enhanced security by restricting access to private routes for unauthenticated users.
- Integrated Cloudinary and Multer for uploading images and videos, with validation to ensure file type and size compliance.
- Authenticated users via the Passport-GitHub2 strategy for reliable identification.
- Ensured data integrity through validation and sanitization of client data using Express-validator.
- Implemented session management to guarantee transactional integrity.
- Utilized Faker.js for generating seed data, ensuring a consistent testing environment.

## Installation

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Start the Server:**
   To start the server in production mode, run:
   ```bash
   npm start
   ```

   To start the server in development mode with automatic restart on file changes, run:
   ```bash
   npm run devstart
   ```

   You can also start the server with debug logs enabled by running:
   ```bash
   npm run serverstart
   ```

4. **Running Tests:**
   To run tests, execute:
   ```bash
   npm test
   ```

## Additional Notes

- Make sure to have Node.js and npm/yarn installed and properly configured on your machine.
- This application uses ESLint for code linting and Prettier for code formatting. You can run linting using:
  ```bash
  npm run lint
  ```
  or
  ```bash
  yarn lint
  ```

- The application utilizes various middleware and packages for functionality such as authentication (Passport.js), data validation (express-validator), logging (morgan), etc.
- For detailed configuration and customization, refer to the `package.json` file and the respective configuration files (`eslintConfig`, `prettier`, etc.).
