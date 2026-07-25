import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    completionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    certificateUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Issued", "Pending", "Approved", "Rejected"],
      default: "Issued",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Enforce unique certificate per student per course
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);
