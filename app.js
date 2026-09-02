const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express(); //returns bunch of methods
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const { errorMiddleware } = require('./controllers/errorController');

//global middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logger middleware
}

const limiter = rateLimit({
  max: 100, //reqs per id
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in an hour!',
});
app.use('/api', limiter); //apply it only to "/api"

app.use(express.json());
app.use(express.static(`${__dirname}/public`)); //to access static files that is not in our routes

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
