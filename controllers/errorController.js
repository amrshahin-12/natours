const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyDB = (err) => {
  const match = err.errmsg.match(/"([^"]*)"/);
  const extractedValue = match ? match[1] : null;
  const message = `Duplicate key value: ${extractedValue}. please use another value `;
  // const message = err.errmsg;
  return new AppError(message, 400);
};

const handleValidationDB = (err) => {
  const Errors = Object.values(err.errors); //object Of Error Objects
  const messages = Object.values(Errors).map((error) => error.message); //array of messages
  const message = messages.join(', ');
  console.log(message);
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    Error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //if it's unkown/ programming error, don't leak error details
    //1) log error
    console.error('ERROR!!!!!!', err);

    //2) send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'something went wrong!',
    });
  }
};
exports.errorMiddleware = (err, req, res, next) => {
  //set a default
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //so we can reassign 'error' and leave 'err'
    let error = err;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationDB(err);
    if (err.code === 11000) error = handleDuplicateKeyDB(err);
    sendErrorProd(error || err, res);
  }
};
