const mongoose = require("mongoose");

const quizresultSchema = new mongoose.Schema({
  courseId: {
    // String,
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Course",
  },
  studentId: {
    // String,
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  quizresult: { sectionid: Number, result: String },
});

//model
const Quizresult = mongoose.model("Quizresult", quizresultSchema);

module.exports = Quizresult;
