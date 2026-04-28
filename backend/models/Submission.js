import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    textAnswer: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Submitted",
    },
  },
  { timestamps: true }
);

// 🔥 duplicate model fix
const Submission =
  mongoose.models.Submission ||
  mongoose.model("Submission", submissionSchema);

export default Submission;