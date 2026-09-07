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
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatings(this.tour);
});

//only to pass the tour ID to the post MW
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //"pre" runs BEFORE the actual findOneAndUpdate/findOneAndDelete hits the DB,
  // so the document still exists here even if this operation is a delete.
  // We need `pre` specifically because of findOneAndDelete: if we waited
  // until `post` to fetch the doc, it would already be gone from the DB
  // (this.findOne() would return null). For findOneAndUpdate alone, `post`
  // would actually work fine too, since `tour` never changes on update

  //executed the query to access the doc, to get the tour ID
  this.rev = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  //this => query obj
  //this.rev => the review doc we attached to the query obj
  //this.rev.constructor => the model
  //statics are called on the model*
  await this.rev.constructor.calcAverageRatings(this.rev.tour);
});

exports.Review = mongoose.model('Review', reviewSchema);
