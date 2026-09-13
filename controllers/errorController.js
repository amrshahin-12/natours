const AppError = require('../utils/appError');

const handleInvalidJWT = (err) => {
  const message = `${err.message}, please login again!`;
  return new AppError(message, 401);
};

const handleExpiredJWT = (err) => {
  const message = `${err.message}, please login again!`;
  return new AppError(message, 401);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyDB = (err) => {
  const match = err.errmsg.match(/"([^"]*)"/);
  const extractedValue = match ? match[1] : null;
  const message = `Duplicate key value: ${extractedValue}. please use another value `;
  return new AppError(message, 400);
};

const handleValidationDB = (err) => {
  const Errors = Object.values(err.errors); //object Of Error Objects
  const messages = Object.values(Errors).map((error) => error.message); //array of messages
  const message = messages.join(', ');
  console.log(message);
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  //checks whether the request came from your API or from a browser page view
  //Natours app has two very different kinds of consumers hitting the same server
  //1. API requests, /api/v1/####
  //2. Rendered page requests,  /####
  if (req.originalUrl.startsWith('/api')) {
    //A) API
    return res.status(err.statusCode).json({
      status: err.status,
      Error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //B) Rendered website
  console.error('ERROR!!!!!!', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //if it's unkown/ programming error, don't leak error details
    // log error
    console.error('ERROR!!!!!!', err);

    // send generic message to client
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong!',
    });
  }

  //B) Rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  //if it's unkown/ programming error, don't leak error details
  // log error
  console.error('ERROR!!!!!!', err);

  // send generic message to client
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later!',
  });
};

exports.errorMiddleware = (err, req, res, next) => {
  //set a default
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //so we can reassign 'error' and leave 'err'
    let error = err;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationDB(err);
    if (err.code === 11000) error = handleDuplicateKeyDB(err);
    if (err.name === 'JsonWebTokenError') error = handleInvalidJWT(err);
    if (err.name === 'TokenExpiredError') error = handleExpiredJWT(err);

    sendErrorProd(error || err, req, res);
  }
};
