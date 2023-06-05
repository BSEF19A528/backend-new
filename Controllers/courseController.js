const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const multer = require("multer");
const sharp = require("sharp");

//keeping image in memory buffer
const multerStorage = multer.memoryStorage();

//multer Filter -- goal is to check if stored item is image if yes then return true otherwise return false.
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an Image! Please upload image only.", 400), false);
  }
};

//multer
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//upload image middleware
exports.uploadCourseImages = upload.fields([
  { name: "selectLogo", maxCount: 1 },
  { name: "selectImage", maxCount: 1 },
]);

//resize image middleware
exports.resizeCourseImages = catchAsync(async (req, res, next) => {
  //console.log(req.files);
  if (!req.files.selectLogo || !req.files.selectImage) return next();

  //1) selectLogo

  req.body.selectLogo = `course-${req.user.id}-${Date.now()}-logo.png`;
  await sharp(req.files.selectLogo[0].buffer)
    .resize(2000, 1333)
    .toFormat("png")
    .jpeg({ quality: 90 })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toFile(`public/img/courses/${req.body.selectLogo}`);

  //2) selectImage

  req.body.selectImage = `course-${req.user.id}-${Date.now()}-image.jpeg`;
  await sharp(req.files.selectImage[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/courses/${req.body.selectImage}`);

  next();
});

//create Course
exports.createCourse = catchAsync(async (req, res, next) => {
  //creating course
  const newCourse = await Course.create({
    courseName: req.body.courseName,
    shortDescription: req.body.shortDescription,
    selectLogo: req.body.selectLogo,
    selectImage: req.body.selectImage,
    solvedExample: req.body.solvedExample,
    courseDuration: req.body.courseDuration,
    difficultylevel: req.body.difficultylevel,
    teacher: req.body.teacher,
    sections: JSON.parse(req.body.sections),
  });

  res.status(200).json({
    //JSEND FORMAT
    status: "success",
    data: {
      course: newCourse,
    },
  });
});

//view Teacher Courses
exports.viewTeacherCourses = catchAsync(async (req, res, next) => {
  //setting teacher id
  if (!req.body.user) req.body.user = req.user.id;
  const newCourse = await Course.find({ teacher: req.body.user });

  if (!newCourse) {
    return next(new AppError("No Course Found with that ID", 404));
  } else
    res.status(200).json({
      //JSEND FORMAT
      status: "success",
      data: newCourse,
    });
});

//view Admin Courses
exports.viewAdminCourses = catchAsync(async (req, res, next) => {
  //query
  const newCourse = await Course.find({ status: "pending" });

  if (!newCourse) {
    return next(new AppError("No Course to Approve", 404));
  } else
    res.status(200).json({
      //JSEND FORMAT
      status: "success",
      data: newCourse,
    });
});

//set Courses status
exports.adminCourseDecision = catchAsync(async (req, res, next) => {
  //query
  const newCourse = await Course.findById(req.params.id);

  if (!newCourse) {
    return next(new AppError("No course found with that ID", 404));
  } else newCourse.status = req.body.status;
  //saving
  await newCourse.save();
  res.status(200).json({
    //JSEND FORMAT
    status: "success",
  });
});

//generic and for students
exports.viewAllCourses = catchAsync(async (req, res, next) => {
  //creating course
  const newCourse = await Course.find({ status: "approved" });

  if (!newCourse) {
    return next(new AppError("No Courses Available!", 404));
  } else
    res.status(200).json({
      //JSEND FORMAT
      status: "success",
      data: newCourse,
    });
});

//for all
exports.viewOneCourse = catchAsync(async (req, res, next) => {
  const newCourse = await Course.findById(req.params.id);

  //error handling code
  if (!newCourse) {
    return next(new AppError("No Course found with that ID", 404));
  }

  //response
  res.status(200).json({
    //JSEND FORMAT
    status: "success",
    data: newCourse,
  });
});

//For Teacher to delete course
exports.deleteCourse = catchAsync(async (req, res, next) => {
  //first getting course based on Id.
  const course = await Course.findById(req.params.id);
  if (course.status == "pending" || course.status == "rejected") {
    //deleting course
    const doc = await Course.findByIdAndDelete(req.params.id);

    //error handling code
    if (!doc) {
      return next(new AppError("No course found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } else {
    return next(new AppError("Approved Course can't be deleted.", 400));
  }
});

//updating course only by teacher
exports.updateCourse = catchAsync(async (req, res, next) => {
  //first getting course based on Id.
  const course = await Course.findById(req.params.id);

  if (course.status == "pending" || course.status == "rejected") {
    const doc = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    //error handling code
    if (!doc) {
      return next(new AppError("No Course found with that ID", 404));
    }

    doc.status = "pending";
    await doc.save({ validateBeforeSave: false });

    res.status(200).json({
      //JSEND FORMAT
      status: "success",
      data: {
        data: doc,
      },
    });
  } else {
    return next(new AppError("Approved Course can't be updated.", 400));
  }
});
