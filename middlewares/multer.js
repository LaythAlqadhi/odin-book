const multer = require('multer');

// Define storage options
const storage = multer.memoryStorage();

// Define file filter function for validation
const fileFilter = (req, file, done) => {
  // Check file type
  const types = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'];
  if (!types.includes(file.mimetype)) {
    return done(
      new Error(
        'Unsupported file type. Only JPEG, PNG, MP4, and MPEG videos are allowed.',
      ),
      false,
    );
  }

  // Check file size
  let maxSize;
  if (file.mimetype.startsWith('image')) {
    maxSize = 5 * 1024 * 1024; // 5MB for images
  } else if (file.mimetype.startsWith('video')) {
    maxSize = 50 * 1024 * 1024; // 50MB for videos
  } else {
    return done(new Error('Unsupported file type'), false);
  }

  if (file.size > maxSize) {
    return done(
      new Error(`File size exceeds the limit (${maxSize / (1024 * 1024)}MB)`),
      false,
    );
  }

  done(null, true);
};

// Configure multer with options
const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
