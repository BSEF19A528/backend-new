const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide valid email!"],
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "teacher", "admin"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    minlength: 5,
    maxlength: 10,
    select: false,
  },
  cpassword: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      validator: function (el) {
        //only works for "create" and "save" command
        return el === this.password; //Ahmar123 === Ahmar123
      },
      message: "Passwords are not the same!",
    },
  },
  profilePic: {
    type: String,
    default: "default.jpg",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  dob: Date,
  phone: String,
  country: String,
  userdescription: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  EmailVerifyToken: String,
  EmailVerifyExpires: Date,
  active: {
    type: "boolean",
    default: true,
    select: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  courses: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Course",
    },
  ],
});

//Password Encryption
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  //Delete passwordConfirm Field.
  this.cpassword = undefined;

  next();
});

//updating passwordChangedAt property
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//instance method for comparing original password and hashed one.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//instance method for checking if password was changed after token issued.
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(changedTimestamp, JWTTimestamp);

    return JWTTimestamp < changedTimestamp; // 100 < 200
  }
  //False means password not changed
  return false;
};

//instance method for reset token generation for forgot password.
userSchema.methods.createPasswordResetToken = function () {
  //creating reser token
  const resetToken = crypto.randomBytes(32).toString("hex");
  //hashing reset token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //console.log({ resetToken }, this.passwordResetToken);

  //setting reset token expires time
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes to reset password

  //Then we need to get plainText resetToken so that can be send back as an email to user
  return resetToken;
};

//instance method for reset token generation for email verify.
userSchema.methods.createEmailVerifyToken = function () {
  //creating reser token
  const resetToken = crypto.randomBytes(32).toString("hex");
  //hashing reset token
  this.EmailVerifyToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //setting reset token expires time
  this.EmailVerifyExpires = Date.now() + 10 * 60 * 1000; //10 minutes to verify email

  //Then we need to get plainText resetToken so that can be send back as an email to user
  return resetToken;
};

//displaying active users only.
userSchema.pre(/^find/, function (next) {
  //this refers to the current query
  this.find({ active: { $ne: false } });
  next();
});

//populating courses
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "courses",
  });
  next();
});

//model
const User = mongoose.model("User", userSchema);

module.exports = User;
