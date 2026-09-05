const mongoose = require('mongoose');
const validator = require('validator');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Must provide review!'],
    },
    rating: {
      type: Number,
      required: [true, 'Review must include rating!'],
      min: [1, 'rating must be atleast 1'],
      max: [5, 'rating must be at most 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      //   required: [true, 'Review must belong to a user.'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  const options = [
    { path: 'user', select: 'name photo' },
    // { path: 'tour', select: 'name  -guides' }, //guides => from Tour pre MW
  ];
  this.populate(options);
  next();
});

exports.Review = mongoose.model('Review', reviewSchema);
