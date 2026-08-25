const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

const port = process.env.PORT;
app.listen(port, '127.0.0.1', () => {
  console.log('listenning...');
});
