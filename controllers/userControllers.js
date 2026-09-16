const _ = require('lodash');
const multer = require('multer');
const sharp = require('sharp');
const { User } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const { validateImageBuffer } = require('../utils/validateImageBuffer');

//to store files on disk
// const multerStorageDisk = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorageMemory = multer.memoryStorage(); //image stored as buffer

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    //first arg: err
    //second arg: true => accept file, false => reject file
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only images.', 400), false);
  }
};

//creates a configured Multer instance
const upload = multer({
  storage: multerStorageMemory,
  fileFilter: multerfilter,
});

//generate the actual middleware function
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  //magic bytes validation => check if it's an image
  await validateImageBuffer(req.file.buffer); //invalid: throws AppError -> caught by catchAsync -> global error handler

  //when we stored img in memory, "req.file.fileName" didn't get defined
  //so we define it here cause we will need it in "updateMe" MW
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); //store it on disk

  next();
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined!',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);

  //1) error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for password updates!'));
  }

  //2) filtered out unwanted fields
  const filteredData = _.pick(req.body, ['name', 'email']);

  //if there's uploaded photo, add it
  if (req.file) filteredData.photo = req.file.filename;

  //3) update user document
  const options = { new: true, runValidators: true };
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredData,
    options,
  );
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

//delete logged in user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User); //for admin

//DO NOT update password with this
exports.updateUser = factory.updateOne(User); //for admin
