import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["mcq", "multiple_select", "true_false", "short", "long", "code"],
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        type: String, // Hold choices list for MCQ and Multiple Select questions
      },
    ],
    correctAnswer: [
      {
        type: String, // String array for correct options/answers (supports multi-select too)
      },
    ],
    explanation: {
      type: String,
      default: "",
    },
    marks: {
      type: Number,
      default: 5,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Question = mongoose.model("Question", questionSchema);
