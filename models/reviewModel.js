//requiring mongoose
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review can not be empty!"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

//model
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
