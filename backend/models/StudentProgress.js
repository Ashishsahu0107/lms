import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    watchPosition: { type: Number, default: 0 }, // Current play position in seconds
    duration: { type: Number, default: 0 },      // Total video duration in seconds
    watchTime: { type: Number, default: 0 },     // Total active time spent watching in seconds
  },
  { _id: true }
);

const studentProgressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    progress: { type: Number, default: 0 }, // percentage 0–100
    lectureProgress: { type: [progressSchema], default: [] },
    lastAccessedTopicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" }, // Resume position pointer
    totalWatchTime: { type: Number, default: 0 }, // Sum of all seconds watched
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

studentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
studentProgressSchema.index({ courseId: 1 });

export const StudentProgress = mongoose.model("StudentProgress", studentProgressSchema);