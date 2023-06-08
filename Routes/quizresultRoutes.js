const express = require("express");

//importing user controller
const authController = require("../Controllers/authController");
const quizresultController = require("../Controllers/quizresultController");

//routes
const router = express.Router();

//authController routes
router.post(
  "/createquizresult",
  authController.protect,
  authController.restrictTo("student"),
  quizresultController.createquizresult
);

//exporting
module.exports = router;
