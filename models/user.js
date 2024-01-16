const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      firstName: String,
      lastName: String,
      fullName: String,
      avatar: String,
    },
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    followingRequests: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true },
);

userSchema.pre('save', function updateFullName(next) {
  if (!this.isModified('profile.firstName') || !this.isModified('profile.lastName')) {
    return next();
  }
  
  this.profile.fullName = `${this.profile.firstName} ${this.profile.lastName}`;
  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
