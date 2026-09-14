const { Tour } = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { User } = require('../models/userModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) get tour data from collection
  const tours = await Tour.find();

  //2) build template
  //3) render that template using the tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    field: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('No tour found.', 404));
  }

  //2) build template
  //3)render template using data from 1)
  res.status(200).render('tour', {
    tour,
    title: `${tour.name} Tour`,
  });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'login',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

//using HTML form and action attribute
exports.UpdateUserDataUsingHTMLForm = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser, //without it "user" in the template will be from protect MW, and it's not the updated
  });
});
