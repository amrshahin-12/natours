const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Tour } = require('../../models/tourModel');
const { Review } = require('../../models/reviewModel');
const { User } = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true, //claude suggested adding this, to fix a bug caused by mongoose being old version
  })
  .then(() => {
    console.log('DB connection successful!');
    if (process.argv[2] === '--import') {
      importData();
    } else if (process.argv[2] === '--delete') {
      deleteAllData();
    }
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('successfully uploaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//delete all data from the collection
const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// if (process.argv[2] === '--import') {
//   importData();
// } else if (process.argv[2] === '--delete') {
//   deleteAllData();
// }

// console.log(process.argv);
