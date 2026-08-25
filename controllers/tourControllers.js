const { Tour } = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    //1A) filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((element) => {
      delete queryObj[element];
    });

    //1B) ADVANCED filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let Query = Tour.find(JSON.parse(queryStr)); //seperated to build the query first

    //2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      Query = Query.sort(sortBy);
    } else {
      //default
      Query = Query.sort('-createdAt');
    }

    //3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      Query = Query.select(fields);
    } else {
      //default
      Query = Query.select('-__v');
    }

    //4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skips = (page - 1) * limit;
    Query = Query.skip(skips).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skips >= numTours) {
        throw new Error("page doesn't exist!");
      }
    }

    // EXECUTE THE QUERY
    const tours = await Query;

    //better method to handle query string
    // const tours = await Tour.find()
    //    .where('maxGroupSize')
    //    .equals(8);

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //return updated doc
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'no tour found with that ID!',
      });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

//middleware
exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
