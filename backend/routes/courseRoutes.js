import express from "express";
import Course from "../models/Course.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();


// 🔹 GET COURSES (STUDENT)
router.get("/", authMiddleware, async (req, res) => {
  const courses = await Course.find({ userId: req.user.id });
  res.json(courses);
});


// 🔹 COMPLETE LESSON (STUDENT)
router.put(
  "/:courseId/lesson/:lessonIndex",
  authMiddleware,
  async (req, res) => {
    const { courseId, lessonIndex } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      userId: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    course.lessons[lessonIndex].completed = true;

    await course.save();

    res.json(course);
  }
);


// 🔥 ADD LESSON (ADMIN ONLY)
router.post(
  "/add-lesson/:courseId",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { title, notes } = req.body;

      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({ msg: "Course not found" });
      }

      course.lessons.push({
        title,
        notes,
      });

      await course.save();

      res.json({ msg: "Lesson added", course });
    } catch (err) {
      console.log("ADD LESSON ERROR:", err);
      res.status(500).json({ msg: "Error adding lesson" });
    }
  }
);


// ✏️ UPDATE LESSON (ADMIN ONLY)
router.put(
  "/update-lesson/:courseId/:lessonIndex",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { courseId, lessonIndex } = req.params;
      const { title, notes } = req.body;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ msg: "Course not found" });
      }

      const lesson = course.lessons[lessonIndex];

      if (!lesson) {
        return res.status(404).json({ msg: "Lesson not found" });
      }

      lesson.title = title ?? lesson.title;
      lesson.notes = notes ?? lesson.notes;

      await course.save();

      res.json({ msg: "Lesson updated", course });
    } catch (err) {
      console.log("UPDATE LESSON ERROR:", err);
      res.status(500).json({ msg: "Error updating lesson" });
    }
  }
);


// 🗑️ DELETE LESSON (ADMIN ONLY)
router.delete(
  "/delete-lesson/:courseId/:lessonIndex",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { courseId, lessonIndex } = req.params;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ msg: "Course not found" });
      }

      if (!course.lessons[lessonIndex]) {
        return res.status(404).json({ msg: "Lesson not found" });
      }

      course.lessons.splice(lessonIndex, 1);

      await course.save();

      res.json({ msg: "Lesson deleted", course });
    } catch (err) {
      console.log("DELETE LESSON ERROR:", err);
      res.status(500).json({ msg: "Error deleting lesson" });
    }
  }
);

export default router;