const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, "Please Enter Course Name!"],
  },
  shortDescription: {
    type: String,
    required: [true, "Please Enter Description!"],
  },
  selectLogo: String,
  selectImage: String,
  solvedExample: {
    type: String,
    required: [true, "Please Enter Solved Example!"],
  },
  courseDuration: {
    type: String,
  },
  difficultylevel: {
    type: String,
  },
  sections: [
    {
      sectionName: String,
      videoData: [{ videoName: String, videoLink: String }],
      quiz: [
        {
          question: String,
          option1: String,
          option2: String,
          option3: String,
          option4: String,
          answer: String,
        },
      ],
    },
  ],
  teacher: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  students: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: true,
  },
  status: {
    type: String,
    default: "pending",
  },
});

//populating courses
courseSchema.pre(/^find/, function (next) {
  this.populate({
    path: "teacher",
    select: "-__v -passwordChangedAt",
  });
  next();
});

//model
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
