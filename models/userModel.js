const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
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
    // default: '2026-08-01',
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
});

//hashing passwords
userSchema.pre('save', async function (next) {
  //only run this func if password has been modified or freshly created
  if (!this.isModified('password')) return next();

  this.password = await passwordHashing.hash(this.password);
  this.passwordConfirm = undefined;
  next();
});

//updating passwordChangedAt property
userSchema.pre('save', function (next) {
  //return if password isn't modified or it's new doc
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  //safety measure, if user didn't change password ever
  //passwordChangedAt is undefiend
  if (!this.passwordChangedAt) {
    return false;
  }

  // .getTime() returns time in miliseconds
  // "JWT iat" is in seconds so we convert passwordChangedAtTimestamp also to seconds
  const passwordChangedAtTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10,
  );

  return passwordChangedAtTimestamp > JWTTimestamp;
  //false => didn't change
  //true => changed after
};

userSchema.methods.createPasswordResetToken = function () {
  //generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set the expiry period to 10 minutes from now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  //return plain reset token to send it via email or wtv
  return resetToken;
};

exports.User = mongoose.model('User', userSchema);
