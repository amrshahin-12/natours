const mongoose = require('mongoose');
const validator = require('validator');
const { Tour } = require('./tourModel');

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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour', //here just for output, since we already filtered to one bucket
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //to persist it to the tours
  // console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};

//"post" so the current review be in the collection before calculating
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

exports.Review = mongoose.model('Review', reviewSchema);
