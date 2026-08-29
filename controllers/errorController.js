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
    sendErrorProd(err, res);
  }
};
