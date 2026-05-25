import mongoose from "mongoose";

const attemptAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedAnswers: [
      {
        type: String, // String response values selected/typed by student
      },
    ],
    isFlagged: {
      type: Boolean,
      default: false, // Flagged status for student bookmark review
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    answers: {
      type: [attemptAnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed", "timed_out"],
      default: "ongoing",
      index: true,
    },
    accuracy: {
      type: Number,
      default: 0, // Percentage accuracy
    },
    timeSpent: {
      type: Number,
      default: 0, // Spent duration tracked in seconds
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizAttemptSchema.index({ studentId: 1, quizId: 1 });

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
