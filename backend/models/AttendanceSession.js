import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g. "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "10:00"
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    marked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const AttendanceSession = mongoose.model(
  "AttendanceSession",
  attendanceSessionSchema,
);
