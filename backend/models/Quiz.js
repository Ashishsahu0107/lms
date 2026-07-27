import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
    },
    instructions: {
      type: String,
      default: "",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      default: 30, // in minutes
      min: 1,
    },
    totalMarks: {
      type: Number,
      default: 100,
      min: 0,
    },
    passingMarks: {
      type: Number,
      default: 40,
      min: 0,
    },
    quizType: {
      type: String,
      enum: ["practice", "exam", "homework"],
      default: "exam",
      index: true,
    },
    attemptLimit: {
      type: Number,
      default: 1, // 0 means unlimited
      min: 0,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
      index: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Search optimization
quizSchema.index({ title: "text", description: "text" });

export const Quiz = mongoose.model("Quiz", quizSchema);
