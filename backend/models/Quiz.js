import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: { type: [optionSchema], default: [] },
    points: { type: Number, default: 1 },
  },
  { _id: true }
);

const quizResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    completedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: { type: [questionSchema], default: [] },
    timeLimit: { type: Number, default: 30 }, // minutes
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    results: { type: [quizResultSchema], default: [] },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizSchema.index({ courseId: 1 });
quizSchema.index({ teacherId: 1 });

export const Quiz = mongoose.model("Quiz", quizSchema);