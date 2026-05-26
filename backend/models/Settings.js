import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "LMS Pro",
    },
    commissionRate: {
      type: Number,
      default: 20,
    },
    allowedUploadSizeMB: {
      type: Number,
      default: 100,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    brandingLogo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model("Settings", settingsSchema);
