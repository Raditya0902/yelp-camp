const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

router
  .route("/")
  .post(validateReview, isLoggedIn, catchAsync(reviews.createReview));

router
  .route("/:reviewId")
  .delete(isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
