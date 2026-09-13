const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const { User } = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const passwordHashing = require('../utils/passwordHashing');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (ID) => {
  return jwt.sign({ id: ID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, data) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, //cookie can't be accessed or modified by browser
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true; //send over secure connections like https
  }
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    ...(data && { data }), //making it optional
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const sentData = {
    user: {
      name: newUser.name,
      email: newUser.email,
    },
  };
  createSendToken(newUser, 201, res, sentData);
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
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

//to protect a route
exports.protect = catchAsync(async (req, res, next) => {
  //1) check if there's token and get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    //check if there's cookie for the token and get it
    token = req.cookies.jwt;
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
  next();
});

//only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  //1) check if there's token
  //here the token will come from cookies only since it's for rendered pages
  //, auth header is for API
  if (req.cookies.jwt) {
    try {
      //check if there's cookie for the token and get it
      //2) verify token
      const decoded = await util.promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      //3) check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //4) check if user changed password after the token was issued
      if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next();
      }

      //there's a looged in user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      // invalid/malformed/expired token — just treat as logged out
      return next();
    }
  }
  next();
};

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with that email address', 404));
  }

  //2) generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n if you didn't forget your password, please ignore this email!`;

  //we want more than sending error message
  //so we handle it here not our global error handlers
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    //reset those in the user doc
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  }).select('+password');

  //2) check if token hasn't expired, and there's user
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  //3) check if new password is diff than old one
  const isSamePassword = await passwordHashing.verify(
    user.password,
    req.body.password,
  );
  if (isSamePassword) {
    return next(
      new AppError(
        'New password must be different from the current password.',
        400,
      ),
    );
  }

  //4) set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //we want the validators

  //5) update password changed at property => via middleware
  //6) log user in, send JWT

  createSendToken(user, 200, res);
});

//for logged in user, no password reset token
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user
  const user = await User.findById(req.user.id).select('+password');

  //2) check if POSTed current password is correct
  if (
    !(await passwordHashing.verify(user.password, req.body.currentPassword))
  ) {
    return next(
      new AppError('currentPassword is incorrect! please try again', 401),
    );
  }

  //3) check if new password is diff than old one
  const isSamePassword = await passwordHashing.verify(
    user.password,
    req.body.password,
  );
  if (isSamePassword) {
    return next(
      new AppError(
        'New password must be different from the current password.',
        400,
      ),
    );
  }

  //4) if so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //5) log user in
  createSendToken(user, 200, res);
});
