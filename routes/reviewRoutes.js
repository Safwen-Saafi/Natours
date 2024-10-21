const express = require('express');
const authController = require('./../controllers/authController');
const {
  deleteReview,
  updateReview,
  setTourUserIds,
  createReview,
  getReview,
  getAllReviews
} = require('./../controllers/reviewController');


// POST /tour/234fad4/reviews
// POST /reviews
const router = express.Router({ mergeParams: true });
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    setTourUserIds,
    createReview
  )
  .get(getAllReviews);
router.route('/:id').patch(updateReview).delete(deleteReview).get(getReview);

module.exports = router;
