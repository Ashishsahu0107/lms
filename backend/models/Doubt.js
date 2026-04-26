import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema({
  course: String,
  topic: String,
  description: String,
  file: String
});

export default mongoose.model("Doubt", doubtSchema);