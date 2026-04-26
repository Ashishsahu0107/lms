import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: String,
  notes: String,
  completed: { type: Boolean, default: false },
});

const courseSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  instructor: String,
  lessons: [lessonSchema],
});

export default mongoose.model("Course", courseSchema);