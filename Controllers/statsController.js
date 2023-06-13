const User = require("../models/userModel");
const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//view stats
exports.viewAdminStats = catchAsync(async (req, res, next) => {
  //Get all users
  const countUsers = await User.countDocuments();

  //Get verified users
  const query = { verified: true };
  const countverified = await User.countDocuments(query);

  //Get admins
  const admin = { role: "admin" };
  const countadmin = await User.countDocuments(admin);

  //Get teachers
  const teacher = { role: "teacher" };
  const countteacher = await User.countDocuments(teacher);

  //Get student
  const student = { role: "student" };
  const countstudent = await User.countDocuments(student);

  //Get all courses
  const countCourses = await Course.countDocuments();

  //Get approved courses
  const q = { status: "approved" };
  const countstatus = await Course.countDocuments(q);

  //sending response
  res.status(200).json({
    status: "success",
    totalusers: countUsers,
    verifiedUsers: countverified,
    unverifiedusers: countUsers - countverified,
    admincount: countadmin,
    teachercount: countteacher,
    studentcount: countstudent,
    totalcourses: countCourses,
    approvedcourses: countstatus,
    othercourses: countCourses - countstatus,
  });
});
