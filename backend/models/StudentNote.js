import mongoose from "mongoose";

const studentNoteSchema = new mongoose.Schema(
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
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    videoPosition: {
      type: Number, // Optional video timestamp where note was created
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for query optimization
studentNoteSchema.index({ studentId: 1, topicId: 1 });

export const StudentNote = mongoose.model("StudentNote", studentNoteSchema);
