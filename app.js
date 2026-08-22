const express = require('express');

const app = express(); //returns bunch of methods
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logger middleware
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`)); //to access static files that is not in our routes

//routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
