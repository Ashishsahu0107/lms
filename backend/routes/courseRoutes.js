import express from "express";
import Course from "../models/Course.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET COURSES
router.get("/", authMiddleware, async (req, res) => {
  const courses = await Course.find({ userId: req.user.id });
  res.json(courses);
});

// COMPLETE LESSON
router.put(
  "/:courseId/lesson/:lessonIndex",
  authMiddleware,
  async (req, res) => {
    const { courseId, lessonIndex } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      userId: req.user.id,
    });

    course.lessons[lessonIndex].completed = true;

    await course.save();

    res.json(course);
  }
);

export default router;