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
  const sectionID = req.body.quizresult.sectionid;
  const result = req.body.quizresult.result;

  console.log(sectionID);
  console.log(result);

  const filter = {
    studentId: studentID,
    courseId: courseID,
    "quizresult.sectionid": sectionID,
  };
  const update = {
    $set: {
      "quizresult.result": result,
    },
  };

  const document = await Quizresult.updateOne(filter, update);

  console.log(document);

  res.status(200).json({
    status: "success",
    message: "Quiz Result updated successfully!",
  });
});

//update quiz result
exports.getquizresult = catchAsync(async (req, res, next) => {
  const studentID = req.user.id;
  const courseID = req.params.id;

  const document = await Quizresult.find(
    { courseId: courseID } && { studentId: studentID }
  );

  console.log(document);

  res.status(200).json({
    status: "success",
    document,
  });

  //}
});
