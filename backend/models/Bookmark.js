import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
    title: {
      type: String,
      default: "Bookmarked Position",
      trim: true,
      maxlength: 100,
    },
    videoPosition: {
      type: Number, // Playback position in seconds
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize retrieval of student bookmarks inside a specific topic
bookmarkSchema.index({ studentId: 1, topicId: 1, videoPosition: 1 });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
