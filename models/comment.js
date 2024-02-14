const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
);

commentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema);
