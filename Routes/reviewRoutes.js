const express = require("express");

//importing review controller
const reviewController = require("../Controllers/reviewController");
const authController = require("../Controllers/authController");

//routes
const router = express.Router();

//Authentication for all routes
router.use(authController.protect);

//creating reviews
router.post(
  "/createReview/:id",
  authController.restrictTo("student"),
  reviewController.createReview
);

//getting all reviews
router.get(
  "/getAllReviews",
  authController.restrictTo("student"),
  reviewController.getAllReviews
);

//deleting a review
// router.delete(
//   "/deleteReview/:id",
//   authController.restrictTo("student"),
//   reviewController.deleteReview
// );

//exporting
module.exports = router;
