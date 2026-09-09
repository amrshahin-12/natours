const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const { User } = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'A tour must have a name'],
      maxlength: [40, 'A tour name must be at most 40 chars'],
      minlength: [10, 'A tour name must be at least 10 chars'],
      // validate: validator.isAlpha,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be easy/ medium/ difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'rating must be atleast 0'],
      max: [5, 'rating must be at most 5'],
      set: (val) => Math.round(val * 10) / 10, //4.666 => 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (discount) {
          //'this' only points to the currently being created doc ".save()/.create()"
          //doesn't work when updating
          return this.price > discount;
        },
        message: 'price must be greater than priceDiscount ({VALUE})',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], //array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 }); //single field
tourSchema.index({ price: 1, ratingsAverage: -1 }); //compound
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review', // model to populate from
  foreignField: 'tour', // field on Review that references Tour
  localField: '_id', // field on Tour that Review.tour points to
});

//document MW
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   next();
// });

//query MW
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

//aggregate MW
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

exports.Tour = mongoose.model('Tour', tourSchema);
