import express from "express";
import Course from "../models/Course.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();


// ================= CREATE COURSE =================
router.post("/enroll", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { userId, title, instructor } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ msg: "userId & title required" });
    }

    const course = await Course.create({
      userId,
      users: [userId],
      title,
      instructor,
      lessons: [],
    });

    res.json(course);

  } catch (err) {
    console.log("CREATE COURSE ERROR:", err);
    res.status(500).json({ msg: "Error creating course" });
  }
});


// ================= GET COURSES (STUDENT) =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({
      $or: [
        { userId: req.user.id },
        { users: req.user._id },
      ],
    });

    res.json(courses || []);
  } catch (err) {
    console.log("GET COURSES ERROR:", err);
    res.status(500).json({ msg: "Error fetching courses" });
  }
});


// ================= GET ALL COURSES (ADMIN) =================
router.get("/all", authMiddleware, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("userId", "name email")
      .populate("users", "name email");

    res.json(courses || []);
  } catch (err) {
    console.log("GET ALL COURSES ERROR:", err);
    res.status(500).json({ msg: "Error fetching all courses" });
  }
});


// ================= ENROLL USER =================
router.post("/enroll-user", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    if (!course.users) course.users = [];

    const already = course.users.some(
      (u) => u.toString() === userId
    );

    if (already) {
      return res.status(400).json({ msg: "Already enrolled" });
    }

    course.users.push(userId);
    await course.save();

    res.json({ msg: "User added to course" });

  } catch (err) {
    console.log("ENROLL ERROR:", err);
    res.status(500).json({ msg: "Enroll error" });
  }
});


// ================= REMOVE USER (🔥 FIXED POSITION) =================
router.post("/remove-user", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    course.users = course.users.filter(
      (u) => u.toString() !== userId
    );

    await course.save();

    res.json({ msg: "User removed" });

  } catch (err) {
    console.log("REMOVE USER ERROR:", err);
    res.status(500).json({ msg: "Remove error" });
  }
});


// ================= COMPLETE LESSON =================
router.put("/:courseId/lesson/:lessonIndex", authMiddleware, async (req, res) => {
  try {
    const { courseId, lessonIndex } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      $or: [
        { userId: req.user.id },
        { users: req.user._id },
      ],
    });

    if (!course) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!course.lessons[lessonIndex]) {
      return res.status(404).json({ msg: "Lesson not found" });
    }

    course.lessons[lessonIndex].completed = true;
    await course.save();

    res.json(course);

  } catch (err) {
    console.log("COMPLETE LESSON ERROR:", err);
    res.status(500).json({ msg: "Error updating lesson" });
  }
});


// ================= ADD LESSON =================
router.post("/add-lesson/:courseId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, notes } = req.body;

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    if (!course.lessons) course.lessons = [];

    course.lessons.push({ title, notes });

    await course.save();

    res.json({ msg: "Lesson added", course });

  } catch (err) {
    console.log("ADD LESSON ERROR:", err);
    res.status(500).json({ msg: "Error adding lesson" });
  }
});


// ================= UPDATE LESSON =================
router.put("/update-lesson/:courseId/:lessonIndex", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { courseId, lessonIndex } = req.params;
    const { title, notes } = req.body;

    const course = await Course.findById(courseId);

    if (!course || !course.lessons[lessonIndex]) {
      return res.status(404).json({ msg: "Lesson not found" });
    }

    const lesson = course.lessons[lessonIndex];

    lesson.title = title ?? lesson.title;
    lesson.notes = notes ?? lesson.notes;

    await course.save();

    res.json({ msg: "Lesson updated", course });

  } catch (err) {
    console.log("UPDATE LESSON ERROR:", err);
    res.status(500).json({ msg: "Error updating lesson" });
  }
});


// ================= DELETE LESSON =================
router.delete("/delete-lesson/:courseId/:lessonIndex", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { courseId, lessonIndex } = req.params;

    const course = await Course.findById(courseId);

    if (!course || !course.lessons[lessonIndex]) {
      return res.status(404).json({ msg: "Lesson not found" });
    }

    course.lessons.splice(lessonIndex, 1);

    await course.save();

    res.json({ msg: "Lesson deleted" });

  } catch (err) {
    console.log("DELETE LESSON ERROR:", err);
    res.status(500).json({ msg: "Error deleting lesson" });
  }
});

// ================= DELETE COURSE =================
router.delete("/delete-course/:courseId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }
    res.json({ msg: "Course deleted successfully" });
  } catch (err) {
    console.log("DELETE COURSE ERROR:", err);
    res.status(500).json({ msg: "Error deleting course" });
  }
});

export default router;