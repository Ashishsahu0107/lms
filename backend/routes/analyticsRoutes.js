import express from "express";
import Attempt from "../models/Attempt.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";     // 🔥 add
import Submission from "../models/Submission.js";     // 🔥 add
import { authMiddleware } from "../middleware/authMiddleware.js";

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
 * 🔥 ADMIN ANALYTICS (FIXED)
 */
router.get("/admin", authMiddleware, async (req, res) => {
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
      Assignment.countDocuments(),                  // 🔥 new
      Submission.countDocuments(),                  // 🔥 new
      Submission.countDocuments({ grade: null }),   // 🔥 new
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
    console.log("Analytics Error:", err);
    res.status(500).json({ msg: "Error" });
  }
});

export default router;