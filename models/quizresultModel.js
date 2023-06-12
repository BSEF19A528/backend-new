const mongoose = require("mongoose");

const quizresultSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Course",
  },

  studentId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  sectionid: Number,
  result: String,
});

quizresultSchema.post("find", function (docs) {
  // Exclude specific fields from each document
  docs.forEach((doc) => {
    doc.courseId = undefined;
    doc.studentId = undefined;
  });
});

//model
const Quizresult = mongoose.model("Quizresult", quizresultSchema);

module.exports = Quizresult;
