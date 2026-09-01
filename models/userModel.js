const mongoose = require('mongoose');
const validator = require('validator');
const passwordHashing = require('../utils/passwordHashing');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'A user must have a name'],
    maxlength: [40, 'A user name must be at most 40 chars'],
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'please provide valid email address'],
    lowercase: true,
    required: [true, 'A user must have an Email'],
    unique: [true, 'Email must be unique'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (pass) {
        return this.password === pass;
      },
      message: 'passwords must be identical!',
    },
    required: [true, 'please confirm the password!'],
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    default: '2026-08-01',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
});

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  // .getTime() returns time in miliseconds
  // "JWT iat" is in seconds so we convert passwordChangedAtTimestamp also to seconds
  const passwordChangedAtTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10,
  );
  if (this.passwordChangedAt) {
    return passwordChangedAtTimestamp > JWTTimestamp;
  }

  //false => didn't change
  //true => changed after
  //default is didn't change
  return false;
};

//hashing passwords
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await passwordHashing.hash(this.password);
  this.passwordConfirm = undefined;
  next();
});

exports.User = mongoose.model('User', userSchema);
