const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

//creating sign token function
const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

//creating send token to the user function
const createSendToken = (user, statusCode, res) => {
  //creating TOKEN
  const token = signToken(user._id);

  //deleting password field
  user.password = undefined;

  //sending response
  res.status(statusCode).json({
    //JSEND FORMAT
    status: "success",
    //sending token back to client
    token,
    data: {
      user: user,
    },
  });
};

//sign up
exports.signup = catchAsync(async (req, res, next) => {
  //creating user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    cpassword: req.body.cpassword,
    role: req.body.role,
    gender: req.body.gender,
    dob: req.body.dob,
    phone: req.body.phone,
    profilePic: req.body.profilePic,
    userdescription: req.body.userdescription,
  });
  //generate the random verify token
  const verifyToken = newUser.createEmailVerifyToken();

  //we are trying to save document but didn't provide the fields which we marked as required. so to avoid that will deactivate all the validations.
  await newUser.save({ validateBeforeSave: false });

  //send it to the user email
  const resetURL = `${process.env.frontend_URL}/api/v1/users/verifyemail/${verifyToken}`;

  const emailTemplate = `<div>
  <h1>Welcome to DevLearn!</h1>
  <p>Please verify your email address by clicking the button below:</p>
  <a href="${resetURL}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">Verify Email</a>
</div>
`;

  try {
    //awaiting the email function
    await sendEmail({
      email: newUser.email,
      subject: "Email Verification( valid for 10 minutes)",
      emailTemplate,
    });

    //sending some response
    res.status(200).json({
      status: "success",
      message: "Email Verification has been send to you!",
    });
  } catch (err) {
    //in case of error while sending email we modifies both properties to undefined.
    newUser.EmailVerifyToken = undefined;
    newUser.EmailVerifyExpires = undefined;
    //as we only modified now will save
    await newUser.save({ validateBeforeSave: false });

    return next(
      new AppError("There was a problem while sending the email", 500)
    );
  }
});

//verifyemail
exports.verifyemail = catchAsync(async (req, res, next) => {
  //1) get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token) //coming from url (:token)
    .digest("hex");

  //getting user from db based on the token
  const user = await User.findOne({
    EmailVerifyToken: hashedToken,
    EmailVerifyExpires: { $gt: Date.now() },
  });

  //2) setting verified to true only if token has not expired and user exist.
  if (!user) {
    return next(new AppError("Token is invalid or Expired!", 400));
  }

  //updating the password in the database.
  user.verified = true;
  //Deleting passwordResetToken and passwordResetExpires:
  user.EmailVerifyToken = undefined;
  user.EmailVerifyExpires = undefined;
  //As it just got modified only so now will also save it.
  await user.save({ validateBeforeSave: false });

  //sending some response
  res.status(200).json({
    status: "success",
    message: "Email Verified",
  });
});

//Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exists.
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  //2) check if user exists  && password is correct.
  const user = await User.findOne({ email: email }).select("+password");

  //if user don't exit and password not matched
  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new AppError("Incorrect Email or Password!", 401));
  }

  //checking if email verified or not.
  if (user.verified == false) {
    //generate the random verify token
    const verifyToken = user.createEmailVerifyToken();

    //we are trying to save document but didn't provide the fields which we marked as required. so to avoid that will deactivate all the validations.
    await user.save({ validateBeforeSave: false });

    //send it to the user email
    const resetURL = `${process.env.frontend_URL}/api/v1/users/verifyemail/${verifyToken}`;

    const emailTemplate = `<div>
  <h1>Welcome to DevLearn!</h1>
  <p>Please verify your email address by clicking the button below:</p>
  <a href="${resetURL}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">Verify Email</a>
</div>
`;

    try {
      //awaiting the email function
      await sendEmail({
        email: user.email,
        subject: "Email Verification( valid for 10 minutes)",
        emailTemplate,
      });

      //sending some response
      res.status(200).json({
        status: "tokensuccess",
        message:
          "Please verify your email Before Login. Email has sent to your account!",
      });
    } catch (err) {
      //in case of error while sending email we modifies both properties to undefined.
      user.EmailVerifyToken = undefined;
      user.EmailVerifyExpires = undefined;
      //as we only modified now will save
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError("There was a problem while sending the email", 500)
      );
    }
  }

  //3) If everything ok, send token to client.
  createSendToken(user, 200, res);
});

//Protect middleware
exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token and checking does it exists.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log(token);

  //if token don't exist, print error
  if (!token) {
    return next(
      new AppError("You are not logged In! Please log In to get Access", 401)
    );
  }
  //2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //3) if verification passed, then checking if user still exists.
  const CurrentUser = await User.findById(decoded.id);
  if (!CurrentUser) {
    return next(
      new AppError(
        "The user belonging to this Token does no longer exists.",
        401
      )
    );
  }
  //4) check if user changed the password after the token was issued.
  if (CurrentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User Recently Changed Password! Please Log In again", 401)
    );
  }

  //5) next middleware will be called.
  //Grant Access to the next middleware
  req.user = CurrentUser;
  next();
});

//restrictTo('admin','teacher') middleware
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles ['admin','teacher] and role = 'student'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };

//forgotPassword
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("No User exists with that email Address", 404));
  }
  //2) generate the random reset token
  const resetToken = user.createPasswordResetToken();

  //we are trying to save document but didn't provide the fields which we marked as required. so to avoid that will deactivate all the validations.
  await user.save({ validateBeforeSave: false });

  //3) send it to the user email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}`;

  //message
  const emailTemplate = `<div>
  <h1>Welcome to DevLearn!</h1>
  <p>Please reset your password by clicking the button below:</p>
  <a href="${resetURL}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">Reset Password</a>
</div>
`;
  try {
    //awaiting the email function
    await sendEmail({
      email: user.email,
      subject: "Your Password reset token ( valid for 10 minutes)",
      emailTemplate,
    });

    //sending some response
    res.status(200).json({
      status: "success",
      message: "Token send via Email!",
    });
  } catch (err) {
    //in case of error while sending email we modifies both properties to undefined.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //as we only modified now will save
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was a problem while sending the email", 500)
    );
  }
});

//resetPassword
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token) //coming from url (:token)
    .digest("hex");

  //getting user from db based on the token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) set new password only if token has not expired and user exist.
  if (!user) {
    return next(new AppError("Token is invalid or Expired!", 400));
  }

  //updating the password in the database.
  user.password = req.body.password;
  user.cpassword = req.body.cpassword;
  //Deleting passwordResetToken and passwordResetExpires:
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  //As it just got modified only so now will also save it.
  await user.save();

  //3) update passwordChangedAt property for the user.

  // //4) log the user in and send JWT
  // createSendToken(user, 200, res);

  //sending some response
  res.status(200).json({
    status: "success",
    message: "Password Reset Successfully!",
  });
});

//updatepassword
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from collection

  const user = await User.findById(req.user.id).select("+password");

  //2) check if posted current password is correct.
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password)) //compare the passwordCurrent with the password stored in db
  ) {
    return next(new AppError("Your current Password is wrong", 401));
  }

  //3) if so , update user
  user.password = req.body.password;
  user.cpassword = req.body.cpassword;

  await user.save();
  //4) log user in , send JWT
  createSendToken(user, 200, res);
});
