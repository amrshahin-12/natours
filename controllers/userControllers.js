const _ = require('lodash');
const { User } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined!',
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
  const options = { new: true, runValidators: true };
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

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User); //for admin

//DO NOT update password with this
exports.updateUser = factory.updateOne(User); //for admin
