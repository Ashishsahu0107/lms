import express from "express";
import Course from "../models/Course.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, async (req, res) => {
  const courses = await Course.find({ userId: req.user.id });

  const total = courses.length;
  const completed = courses.filter(
    (c) => c.completedLessons === c.totalLessons
  ).length;

  const score =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const performance = [
    { name: "Courses", value: score },
    { name: "Assignments", value: completed * 10 },
    { name: "Quiz", value: completed * 8 },
    { name: "Attendance", value: completed * 9 },
  ];

  const activity = courses.map((c, i) => ({
    day: `C${i + 1}`,
    value: Math.round(
      (c.completedLessons / c.totalLessons) * 5
    ),
  }));

  res.json({
    score,
    assignments: `${completed}/${total}`,
    streak: completed,
    skills: `${completed}/10`,
    performance,
    activity,
  });
});

export default router;