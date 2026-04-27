import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  // 🔥 FIX: same name use everywhere
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  question: {
    type: String,
    required: true,
  },

  options: {
    type: [String],
    required: true,
  },

  // 🔥 FIX: store correct option index
  correct: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("Quiz", quizSchema);