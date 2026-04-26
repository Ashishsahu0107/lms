import express from "express";
import Attempt from "../models/Attempt.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔹 LEADERBOARD (top users by avg score)
 * returns: [{ userId, name, avgScore, attempts }]
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

    // attach user names
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
 * 🔹 ADMIN ANALYTICS
 * returns: { users, courses, attempts, avgScore }
 */
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const [users, courses, attempts] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Attempt.countDocuments(),
    ]);

    const avg = await Attempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);

    res.json({
      users,
      courses,
      attempts,
      avgScore: Math.round(avg[0]?.avgScore || 0),
    });
  } catch (err) {
    console.log("Analytics Error:", err);
    res.status(500).json({ msg: "Error" });
  }
});

export default router;