const fs = require('fs');
//reading files
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

exports.checkID = (req, res, next, val) => {
  console.log(`ID is: ${val}`);
  if (val >= tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'ID not valid!',
    });
  next();
};

exports.checkBody = (req, res, next) => {
  //   if (!(req.body.hasOwnProperty('name') && req.body.hasOwnProperty('price'))) {
  //     return res.status(400).json({
  //       status: 'fail',
  //       message: 'missing name or price!',
  //     });
  //   }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tours: tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const wantedTour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'success',
    data: {
      tour: wantedTour,
    },
  });
};

exports.createTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newID }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        tour: newTour,
      });
    },
  );
};
