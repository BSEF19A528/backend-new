const User = require("../models/userModel");
const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Quizresult = require("../models/quizresultModel");

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

//unenroll course
exports.unenrollCourses = catchAsync(async (req, res, next) => {
  //Getting student id and course id from body.
  const { studentId, courseId } = req.body;

  // Find the student by ID
  const user = await User.findById(studentId);

  if (!user) {
    return next(new AppError("No user exists with that id!", 404));
  }

  // Access the array field and remove the ID
  const courses = user.courses;
  console.log(courses);

  const result = await User.updateOne(
    { _id: studentId, courses: courseId },
    { $pull: { courses: courseId } }
  );

  if (result.matchedCount === 0) {
    console.log("ID not found in the array");
    return;
  }

  //deleting its quizes records

  const quizrecord = await Quizresult.find({
    courseId,
    studentId,
  });

  console.log(quizrecord);

  const documentIds = quizrecord.map((record) => record._id);

  const filter = { _id: { $in: documentIds } };

  const results = await Quizresult.deleteMany(filter);

  //sending response
  res.status(200).json({
    status: "success",
    message: "student unenrolled!",
  });
});
