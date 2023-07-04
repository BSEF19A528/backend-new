const express = require("express");

//importing user controller
const enrollController = require("../Controllers/enrollController");
const authController = require("../Controllers/authController");

//routes
const router = express.Router();

//to enroll course
router.patch(
  "/enrollStudentinCourse",
  authController.protect,
  authController.restrictTo("student"),
  enrollController.enrollStudentinCourse
);

//to view all enrolled courses
router.get(
  "/viewEnrolledCourses",
  authController.protect,
  authController.restrictTo("student"),
  enrollController.viewEnrolledCourses
);

router.patch(
  "/unenrollCourse",
  authController.protect,
  authController.restrictTo("student"),
  enrollController.unenrollCourses
);

//exporting
module.exports = router;
