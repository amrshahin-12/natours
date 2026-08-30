const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const passwordHashing = require('../utils/passwordHashing');
const AppError = require('../utils/appError');

const signToken = (ID) => {
  return jwt.sign({ id: ID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password!', 400));
  }

  //check if email and password types are correct
  if (typeof password !== 'string' || typeof email !== 'string') {
    return next(new AppError('Invalid input type', 400));
  }

  //2) check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  //queries for a user by email, and explicitly re-includes the password field

  if (!user || !(await passwordHashing.verify(user.password, password))) {
    return next(new AppError('email or password is incorrect!', 401));
  }
  //3) if valid, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
