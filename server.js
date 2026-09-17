const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!');
  console.log(err.name);
  console.log(err.message);
  console.log(err);
  process.exit(1);
});

//to read env variables from the file and save them
//to nodeJS environment vars
dotenv.config({ path: './config.env' });

const app = require('./app');
const { Tour } = require('./models/tourModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

const port = process.env.PORT || 8000;
const server = app.listen(port, '127.0.0.1', () => {
  console.log('listenning...');
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!!');
  console.log(err.name);
  console.log(err.message);

  //shutting down the app gracefully
  server.close(() => {
    //closes server first
    //and then runs this callback
    process.exit(1); //then we shut down
  });
});
