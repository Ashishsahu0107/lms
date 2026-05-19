import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, default: "" },
    grade: { type: Number, default: null },
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date },
  },
  { _id: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    fileUrl: { type: String, default: "" }, // PDF upload path
    submissions: { type: [submissionSchema], default: [] },
    totalPoints: { type: Number, default: 100 },
  },
  { timestamps: true }
);

assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ teacherId: 1 });

export const Assignment = mongoose.model("Assignment", assignmentSchema);