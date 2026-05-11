import express from "express";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= CREATE ASSIGNMENT =================
router.post("/", protect, authorizeRoles("teacher","superAdmin"), async (req, res) => { 
    // Teacher scope enforcement: teacher can only create for courses they own
    if (req.user.role === "teacher") {
      const course = await (await import("../models/Course.js")).default.findById(req.body.course);
      if (!course) return res.status(404).json({ msg: "Course not found" });
      if (course.userId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Access denied (Not your course)" });
      }
    }

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
    // Filter assignments by role scope
    // - superAdmin: all
    // - teacher: only assignments for courses they own
    // - student: only assignments for enrolled courses

  try {
    const assignmentsQuery = { };

    if (req.user.role === "teacher") {
      const { default: Course } = await import("../models/Course.js");
      const courses = await Course.find({ userId: req.user._id }).select("_id");
      const courseIds = courses.map((c) => c._id);
      assignmentsQuery.course = { $in: courseIds };
    }

    if (req.user.role === "user") {
      const { default: Course } = await import("../models/Course.js");
      const courses = await Course.find({ users: req.user._id }).select("_id");
      const courseIds = courses.map((c) => c._id);
      assignmentsQuery.course = { $in: courseIds };
    }

    const assignments = await Assignment.find(assignmentsQuery)
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