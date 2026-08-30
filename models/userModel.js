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
});

//hashing passwords
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await passwordHashing.hash(this.password);
  this.passwordConfirm = undefined;
  next();
});

exports.User = mongoose.model('User', userSchema);
