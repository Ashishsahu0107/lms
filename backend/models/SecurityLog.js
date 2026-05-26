import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
      index: true,
    },
    device: {
      type: String,
      default: "",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);
