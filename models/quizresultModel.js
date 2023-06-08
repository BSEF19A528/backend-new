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
  quizresult: [{ sectionid: mongoose.SchemaTypes.ObjectId, result: String }],
});

//model
const Quizresult = mongoose.model("Quizresult", quizresultSchema);

module.exports = Quizresult;
