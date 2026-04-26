import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  question: String,
  options: [String],
  correct: Number,
});

export default mongoose.model("Quiz", quizSchema);