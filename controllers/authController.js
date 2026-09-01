const jwt = require('jsonwebtoken');
const util = require('util');
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
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
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

//to protect a route
exports.protect = catchAsync(async (req, res, next) => {
  //1) check if there's token and get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('please log in to get access!', 401));
  }

  //2) verify token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  //3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('token belongs to a user that no longer exists!', 401),
    );
  }

  //4) check if user changed password after the token was issued
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please login again.'),
    );
  }

  //grant access to protected route
  req.user = currentUser; //custom property
  console.log(req.user);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin', 'lead-guide']
    //the person's role is stored on "req.user" since .protect is called before this MW
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403),
      );
    }
    next();
  };
};
