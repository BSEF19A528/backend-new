const User = require("../models/userModel");
const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Quizresult = require("../models/quizresultModel");

//create quiz result
exports.createquizresult = catchAsync(async (req, res, next) => {
  const results = await Quizresult.create(req.body);

  res.status(200).json({
    status: "success",
    message: "Quiz result created successfully!",
  });
});

//update quiz result
exports.updatequizresult = catchAsync(async (req, res, next) => {
  const studentID = req.body.studentId;
  const courseID = req.body.courseId;
  const sectionID = req.body.sectionid;
  const results = req.body.result;

  console.log(sectionID);
  console.log(results);

  const filter = {
    studentId: studentID,
    courseId: courseID,
    sectionid: sectionID,
  };
  const update = {
    $set: {
      result: results,
    },
  };

  const document = await Quizresult.updateOne(filter, update);

  //console.log(document);

  res.status(200).json({
    status: "success",
    message: "Quiz Result updated successfully!",
  });
});

//get quiz result
exports.getquizresult = catchAsync(async (req, res, next) => {
  const projectionFields = {
    __v: 0,
    _id: 0,
  };

  const document = await Quizresult.find(
    {
      courseId: req.params.id,
      studentId: req.user.id,
    },
    projectionFields
  );
  console.log(document);

  res.status(200).json({
    status: "success",
    document,
  });
});
