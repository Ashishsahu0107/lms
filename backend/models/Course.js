import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 }, // seconds
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const ratingSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: { type: Number, min: 1, max: 5, default: 0 },
    comment: { type: String, default: "" },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lectures: { type: [lectureSchema], default: [] },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ratings: { type: [ratingSchema], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    tags: [{ type: String }],
    totalDuration: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

courseSchema.index({ teacherId: 1 });
courseSchema.index({ status: 1 });

export const Course = mongoose.model("Course", courseSchema);