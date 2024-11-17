const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      validate: {
        validator: function (v) {
          return validator.isAlpha(v, 'en-US', { ignore: ' -' });
        },
        message:
          'Tour name must only contain alphabetic characters, spaces, or hyphens',
      },
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
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
        default: 'easy',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
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
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // Geo JSON
      type: {
        type: String,
        default: 'Point',
        enum: {
          values: ['Point'],
          message: 'Start location type must be "Point"',
        },
      },
      coordinates: {
        type: [Number],
        required: [true, 'Start location coordinates are required'],
        validate: {
          validator: function (val) {
            return val.length === 2;
          },
          message:
            'Coordinates should have exactly 2 elements (longitude and latitude)',
        },
      },
      address: {
        type: String,
        required: [true, 'Start location address is required'],
      },
      description: {
        type: String,
        required: [true, 'Start location description is required'],
      },
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: {
            values: ['Point'],
            message: 'Location type must be "Point"',
          },
          required: [true, 'Location type is required'],
        },
        coordinates: {
          type: [Number],
          required: [true, 'Location coordinates are required'],
          validate: {
            validator: function (val) {
              return val.length === 2;
            },
            message:
              'Coordinates should have exactly 2 elements (longitude and latitude)',
          },
        },
        address: {
          type: String,
          required: [true, 'Location address is required'],
        },
        description: {
          type: String,
          required: [true, 'Location description is required'],
        },
        day: {
          type: Number,
          required: [true, 'Location day is required'],
        },
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
    toJSON: { virtuals: true }, //Virtual fields are fields not stored in the database but calculated or derived from other fields
    toObject: { virtuals: true }, //These two lines include virtual fields and define custom transformations when converting documents to different formats.
  }
);

// Custom validation to ensure at least one location is found per tour
tourSchema.path('locations').validate(function (value) {
  return value && value.length > 0;
}, 'A tour must have at least one location to pass by');

//Just a simple example on how to create a virtual field
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// !These are the indexes, optimize query performance
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// !Virtual populate, this is a one to many referencing, parent referencing, the tour ids are in the review model and we are referencing them
// It doesn't physically store a reference to reviews in the Tour document; instead, it creates a virtual field that,
// when queried, will dynamically pull in related Review documents based on the tour reference in the Review model.
tourSchema.virtual('reviews', {
  ref: 'Review', //Name of the model we want to reference
  foreignField: 'tour', //We specify the id of the tour in the review model to connect
  localField: '_id', //Where the id is stored in this model to match it with the previous field, you won't find it here, accessible from mongoCompass
});

// !DOCUMENT MIDDLEWARE:
// this middleware runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// !QUERY MIDDLEWARE
// any query that starts with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //This line hides the secret tours to be displayed for the user
  this.start = Date.now(); //This is used to mark the start of the query request
  next();
});

tourSchema.post(/^find/, function (next) {
  // Set a 300ms delay before logging the query duration
  setTimeout(() => {
    console.log(`Query took ${Date.now() - this.start - 300} milliseconds!`);
  }, 300); // 300 milliseconds delay, why I used this, because the morgan logger is logged after this message, and I want the inverse
});

// !Pre middleware to pupulate all of the guides, which means to replace the simple id with the whole document
// explicitly store the ObjectIds in the guides array, ths is child referencing
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', // Fields to exclude from the guides field
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
