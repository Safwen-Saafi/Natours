const Review = require('./../models/reviewModel');
const factory = require('./../controllers/handlerFactory');



exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes to get users and tours id to use in nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
