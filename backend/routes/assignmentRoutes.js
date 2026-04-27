import express from "express";
import Assignment from "../models/Assignment.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👉 CREATE ASSIGNMENT (Admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, course, dueDate } = req.body;

    // 🔥 VALIDATION (IMPORTANT)
    if (!title || !description || !course || !dueDate) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course,
      dueDate,
      createdBy: req.user._id,
    });

    res.status(201).json(assignment);

  } catch (err) {
    console.log("ASSIGNMENT ERROR:", err); // 🔥 VERY IMPORTANT
    res.status(500).json({
      message: err.message || "Error creating assignment",
    });
  }
});


// 👉 GET ALL ASSIGNMENTS (Student)
router.get("/", protect, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.json(assignments);

  } catch (err) {
    console.log("FETCH ASSIGNMENTS ERROR:", err); // 🔥 ADD THIS
    res.status(500).json({
      message: err.message || "Error fetching assignments",
    });
  }
});

export default router;