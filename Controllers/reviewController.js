const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//Create a new review
exports.createReview = catchAsync(async (req, res, next) => {
  //getting course id from the url.
  if (!req.body.course) req.body.course = req.params.id;
  //getting current user from protectmiddleware
  if (!req.body.user) req.body.user = req.user.id;

  const results = await Review.create(req.body);

  res.status(200).json({
    status: "success",
    message: "Review Created Successfully!",
  });
});

//getting all reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  //getting current user from protectmiddleware
  if (!req.body.user) req.body.user = req.user.id;

  const query = {
    user: req.user.id,
  };

  const results = await Review.find(query);

  res.status(200).json({
    status: "success",
    results,
  });
});

// //Delete Review
// exports.deleteReview = catchAsync(async (req, res, next) => {
//   const results = await Review.findByIdAndDelete(req.params.id);

//   if (!results) {
//     return next(new AppError("No review found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     message: "Review deleted successfully",
//     data: null,
//   });
// });
