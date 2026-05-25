import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
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
    attachments: [
      {
        type: String, // URLs of downloadable sheets (PDF, ZIP, DOCX, images)
      },
    ],
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    totalMarks: {
      type: Number,
      default: 100,
      min: 0,
    },
    assignmentType: {
      type: String,
      enum: ["written", "mcq", "code", "document"],
      default: "written",
      index: true,
    },
    generatedFromDocument: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize search indexes
assignmentSchema.index({
  title: "text",
  description: "text",
});

export const Assignment = mongoose.model("Assignment", assignmentSchema);