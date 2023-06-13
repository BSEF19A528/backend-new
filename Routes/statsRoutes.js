const express = require("express");

//importing user controller
const statsController = require("../Controllers/statsController");
const authController = require("../Controllers/authController");

//routes
const router = express.Router();

//to view all enrolled courses
router.get(
  "/viewAdminStats",
  authController.protect,
  authController.restrictTo("admin"),
  statsController.viewAdminStats
);

//exporting
module.exports = router;
