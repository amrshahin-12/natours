const { Review } = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const { Tour } = require('../models/tourModel');

// const getReview = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.tourId).populate({
//     path: 'reviews',
//   });

//   const { reviews } = tour;
//   res.status(200).json({
//     status: 'success',
//     data: { reviews },
//   });
// });

exports.getAllReviews = catchAsync(async (req, res, next) => {
  //bad sol, more queries
  //   if (req.params.tourId) {
  //     return getReview(req, res, next);
  //   }

  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //allow nested routes
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newReview },
  });
});
