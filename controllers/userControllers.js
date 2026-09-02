const _ = require('lodash');
const { User } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'not yet implemented!',
  });
};

exports.getUser = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for password updates!'));
  }

  //2) filtered out unwanted fields
  const filteredData = _.pick(req.body, ['name', 'email']);

  //3) update user documen
  const options = { new: true, validators: true };
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredData,
    options,
  );
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

//delete logged in user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
  });
});
