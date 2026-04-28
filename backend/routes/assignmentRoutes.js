import express from "express";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= CREATE ASSIGNMENT =================
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, course, dueDate } = req.body;

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
    console.log("ASSIGNMENT ERROR:", err);
    res.status(500).json({
      message: err.message || "Error creating assignment",
    });
  }
});


// ================= GET ASSIGNMENTS =================
router.get("/", protect, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("course", "title")
      .sort({ createdAt: -1 });

    const submissions = await Submission.find({
      user: req.user._id,
    });

    const updated = assignments.map((a) => {
      const submitted = submissions.find(
        (s) => s.assignment.toString() === a._id.toString()
      );

      return {
        ...a._doc,
        status: submitted ? "Submitted" : "Pending",
      };
    });

    res.json(updated);

  } catch (err) {
    console.log("FETCH ERROR:", err);
    res.status(500).json({
      message: "Error fetching assignments",
    });
  }
});

export default router;