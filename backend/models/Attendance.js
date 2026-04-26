import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  courseId: String,
  records: [
    {
      date: String,
      present: Boolean
    }
  ]
});

export default mongoose.model("Attendance", attendanceSchema);