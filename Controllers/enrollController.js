const User = require("../models/userModel");
const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//enrolling student
exports.enrollStudentinCourse = catchAsync(async (req, res, next) => {
  //Getting student id and course id from body.
  const { studentId, courseId } = req.body;

  // Find the student by ID
  const user = await User.findById(studentId);

  if (!user) {
    return next(new AppError("PLease SignUp to get enrolled!", 404));
  }

  // Update the enrolledCourses array of the student
  user.courses.push(courseId);

  // Save the updated user object
  await user.save({ validateBeforeSave: false });

  // Find the course by ID
  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("No Course Found with that ID !", 404));
  }

  // Update the students array of the course
  course.students.push(studentId);
  // Save the updated course object
  await course.save({ validateBeforeSave: false });

  //sending response
  res.status(200).json({
    status: "success",
    message: "Student Enrolled Successfully!",
  });
});

//view enrolled courses
exports.viewEnrolledCourses = catchAsync(async (req, res, next) => {
  //getting student id from req.user
  const studentId = req.user.id;

  // Find the student by ID
  const user = await User.findById(studentId);

  if (!user) {
    return next(new AppError("No user exists with that id!", 404));
  }

  //sending response
  res.status(200).json({
    status: "success",
    data: user,
  });
});
