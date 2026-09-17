const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express(); //returns bunch of methods
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const { errorMiddleware } = require('./controllers/errorController');

//set template engine => pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARES

//to access static files that is not in our routes
app.use(express.static(path.join(__dirname, 'public')));

//security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
        styleSrc: [
          "'self'",
          'https://unpkg.com',
          'https://fonts.googleapis.com',
          "'unsafe-inline'",
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'https://*.basemaps.cartocdn.com',
          'https://unpkg.com',
        ],
        connectSrc: [
          "'self'",
          'https://*.basemaps.cartocdn.com',
          'https://unpkg.com',
          'https://cdn.jsdelivr.net',
        ],
      },
    },
  }),
);

//scriptSrc => allows the Leaflet JS file to actually load
//styleSrc => allows Leaflet's CSS file too
//imgSrc => OSM tile images come from subdomains like a.tile.openstreetmap.org

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

//parses incoming requests with JSON bodies (e.g. AJAX calls) into req.body
app.use(express.json({ limit: '10Kb' }));

//parses the Cookie header on every incoming request into req.cookies
app.use(cookieParser());

//parses incoming requests with URL-encoded bodies (plain HTML <form> submissions) into req.body
app.use(express.urlencoded({ extended: true, limit: '10Kb' }));

//data sanitization against  NoSQL query injection
app.use(mongoSanitize());

//data sanitization against  XSS
//TO:DO

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//compress texts/ html sent to clients
app.use(compression());

//routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//.all => for all http verbs
//'*': Matches any path/URL string on your server
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl}`, 404));
});

app.use(errorMiddleware);

module.exports = app;
