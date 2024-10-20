const express = require('express');
const authController = require('./../controllers/authController');
const { deleteReview } = require('./../controllers/reviewController');

const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');

// POST /tour/234fad4/reviews
// POST /reviews
const router = express.Router({ mergeParams: true });
router
  .route('/')
  .post(authController.protect, authController.restrictTo('user'), createReview)
  .get(getAllReviews);
router.route('/:id').delete(deleteReview);

module.exports = router;
