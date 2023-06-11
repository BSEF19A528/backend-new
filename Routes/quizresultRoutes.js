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

router.patch(
  "/updatequizresult",
  authController.protect,
  authController.restrictTo("student"),
  quizresultController.updatequizresult
);

router.get(
  "/getquizresult/:id",
  authController.protect,
  authController.restrictTo("student"),
  quizresultController.getquizresult
);

//exporting
module.exports = router;
