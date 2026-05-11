import express from "express";
import Attempt from "../models/Attempt.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import {
  authMiddleware,
  teacherOnly,
  superAdminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔹 LEADERBOARD
 */
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const data = await Attempt.aggregate([
      {
        $group: {
          _id: "$userId",
          avgScore: { $avg: "$score" },
          attempts: { $sum: 1 },
        },
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
    ]);

    const users = await User.find({
      _id: { $in: data.map((d) => d._id) },
    }).select("name email");

    const map = {};
    users.forEach((u) => (map[u._id] = u));

    const result = data.map((d) => ({
      userId: d._id,
      name: map[d._id]?.name || "User",
      avgScore: Math.round(d.avgScore),
      attempts: d.attempts,
    }));

    res.json(result);
  } catch (err) {
    console.log("Leaderboard Error:", err);
    res.status(500).json({ msg: "Error" });
  }
});

/**
 * 🔹 SUPER ADMIN OVERVIEW
 */
router.get("/superadmin", authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const [
      users,
      courses,
      attempts,
      assignments,
      submissions,
      pendingSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Attempt.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ grade: null }),
    ]);

    const avg = await Attempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);

    res.json({
      users,
      courses,
      attempts,
      avgScore: Math.round(avg[0]?.avgScore || 0),
      assignments,
      submissions,
      pendingSubmissions,
    });
  } catch (err) {
    console.log("SuperAdmin Analytics Error:", err);
    res.status(500).json({ msg: "Error" });
  }
});

/**
 * 🔹 TEACHER ANALYTICS
 */
router.get("/teacher", authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [assignments, submissions, attempts] = await Promise.all([
      Assignment.countDocuments({ createdBy: req.user._id }),
      Submission.countDocuments({ user: req.user._id }),
      Attempt.countDocuments({ userId: req.user._id }),
    ]);

    res.json({ assignments, submissions, attempts });
  } catch (err) {
    console.log("Teacher Analytics Error:", err);
    res.status(500).json({ msg: "Error" });
  }
});

export default router;

