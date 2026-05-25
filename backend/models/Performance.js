import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    averageQuizScore: {
      type: Number,
      default: 0,
    },
    assignmentsCompleted: {
      type: Number,
      default: 0,
    },
    courseProgress: {
      type: Number,
      default: 0,
    },
    lastAttemptDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate student-course performance rows
performanceSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Performance = mongoose.model("Performance", performanceSchema);
