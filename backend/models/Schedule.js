import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["class", "assignment", "quiz", "event"],
      required: true,
      default: "class",
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      index: true,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null, // If personal event, otherwise course-wide
    },
    meetingUrl: {
      type: String,
      default: "", // Zoom or Google Meet link for classes
    },
    meetingId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Schedule = mongoose.model("Schedule", scheduleSchema);
