const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");

//multer Storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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
exports.uploadUserPhoto = upload.single("profilePic");

//resize image middleware
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  //If there is no file uploaded then simply return to next middleware.
  if (!req.file) return next();

  //setting req.file.filename so we can use it later
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  //it returns an object to which we can chain methods
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

//filterObj function
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//update me
exports.updateMe = catchAsync(async (req, res, next) => {
  //1) create error if user posts password data
  if (req.body.password || req.body.cpassword) {
    return next(
      new AppError(
        "This route is not for password Updates. Please use /updateMyPassword.",
        401
      )
    );
  }

  //2) update user document.
  const filteredBody = filterObj(
    req.body,
    "name",
    "profilePic",
    "gender",
    "dob",
    "phone",
    "country",
    "userdescription"
  );
  if (req.file) filteredBody.profilePic = req.file.filename;

  //update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, //to get updated object instead of old one.
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

//Get All Users
exports.getAllUsers = async (req, res, next) => {
  //creating user
  const newUser = await User.find();

  res.status(200).json({
    //JSEND FORMAT
    status: "success",
    //sending token back to client
    data: {
      user: newUser,
    },
  });
};

//Get one User
exports.getOneUser = async (req, res, next) => {
  //creating user
  const newUser = await User.findById(req.params.id);

  res.status(200).json({
    //JSEND FORMAT
    status: "success",
    //sending token back to client
    data: {
      user: newUser,
    },
  });
};

//For Teacher to delete course
exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "success",
    data: null,
  });
});
