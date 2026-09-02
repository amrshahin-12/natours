const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express(); //returns bunch of methods
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const { errorMiddleware } = require('./controllers/errorController');

//GLOBAL MIDDLEWARES
//security HTTP headers
app.use(helmet());

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logger middleware
}

//limit requests
const limiter = rateLimit({
  max: 100, //reqs per id
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in an hour!',
});
app.use('/api', limiter); //apply it only to "/api"

//body parser, reading data from body into req.body
app.use(express.json());

//data sanitization against  NoSQL query injection
app.use(mongoSanitize);

//data sanitization against  XSS
//TO:DO

//to access static files that is not in our routes
app.use(express.static(`${__dirname}/public`));

//routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//.all => for all http verbs
//'*': Matches any path/URL string on your server
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl}`, 404));
});

app.use(errorMiddleware);

module.exports = app;
