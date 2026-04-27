import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
  },
  { timestamps: true }
);

// 🔥 FIX: duplicate model error solve
const Attempt =
  mongoose.models.Attempt ||
  mongoose.model("Attempt", attemptSchema);

export default Attempt;