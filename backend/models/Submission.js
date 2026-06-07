import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    files: [
      {
        type: String,
      },
    ],
    textAnswer: {
      type: String,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    marks: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "graded", "late"],
      default: "pending",
      index: true,
    },
    rubricEvaluation: [
      {
        criterionTitle: {
          type: String,
          required: true,
          trim: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
        },
        feedback: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only have a single submission per assignment
submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

export const Submission = mongoose.model("Submission", submissionSchema);
