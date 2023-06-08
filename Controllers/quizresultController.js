const User = require("../models/userModel");
const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//create quiz result
exports.createquizresult = catchAsync(async (req, res, next) => {
  //sending response
  res.status(200).json({
    status: "success",
    message: "hello",
    // data: user,
  });
});
6