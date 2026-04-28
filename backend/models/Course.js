import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: String,
  notes: String,
  completed: { type: Boolean, default: false },
});

const courseSchema = new mongoose.Schema({
  // 🔹 OLD (keep for backward compatibility)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // 🔥 NEW (multi-user enrollment)
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  title: String,
  instructor: String,
  lessons: [lessonSchema],
});

export default mongoose.model("Course", courseSchema);