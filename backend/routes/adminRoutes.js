import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import {
  protect,
  authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 ADMIN ANALYTICS
router.get(
  "/stats",
  protect,
  authorizeRoles('superAdmin'),
  async (req, res) => {
    const users = await User.find();
    const courses = await Course.find();

    const totalUsers = users.length;
    const totalCourses = courses.length;

    const completedCourses = courses.filter(
      (c) => c.completedLessons === c.totalLessons
    ).length;

    res.json({
      totalUsers,
      totalCourses,
      completedCourses,
    });
  }
);

export default router;