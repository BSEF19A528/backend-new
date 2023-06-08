const express = require("express");

//importing user controller
const enrollController = require("../Controllers/enrollController");
const authController = require("../Controllers/authController");

//routes
const router = express.Router();

//to enroll course
router.post(
  "/enrollStudentinCourse",
  authController.protect,
  authController.restrictTo("student"),
  enrollController.enrollStudentinCourse
);

//to view enrolled courses
router.get(
  "/viewEnrolledCourses",
  authController.protect,
  authController.restrictTo("student"),
  enrollController.viewEnrolledCourses
);

//exporting
module.exports = router;
