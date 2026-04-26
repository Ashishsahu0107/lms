import express from "express";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// Get attendance
router.get("/:courseId", async (req, res) => {
  const data = await Attendance.findOne({ courseId: req.params.courseId });
  res.json(data);
});

// Calculate percentage
router.get("/:courseId/percentage", async (req, res) => {
  const data = await Attendance.findOne({ courseId: req.params.courseId });

  const total = data.records.length;
  const present = data.records.filter(r => r.present).length;

  const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

  res.json({ percentage });
});

export default router;