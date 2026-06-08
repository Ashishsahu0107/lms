import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getEnrolledCoursesController,
  getCourseDetailsController,
  enrollCourseController,
  updateProgressController,
  submitAssignmentController,
  submitQuizController,
  getCertificateController,
  getProgressDetailsController,
  getStudentAnalyticsInsightsController,
} from "../controllers/student.controller.js";
import {
  getMyAttendanceController,
  getMyAttendanceCalendarController,
  getMyAttendancePercentageController,
} from "../controllers/studentAttendance.controller.js";
import {
  getCoursePlayerDetails,
  updateWatchProgress,
  createOrUpdateNote,
  getStudentNotes,
  createBookmark,
  getStudentBookmarks,
  getDiscussionMessages,
  postDiscussionMessage,
} from "../controllers/coursePlayer.controller.js";

const router = Router();

// All routes require authenticated student
router.use(authenticate, authorize("student"));

// ── Courses & Progress ────────────────────────────────────────────────────────
router.get("/courses", getEnrolledCoursesController);
router.get("/course/:id", getCourseDetailsController);
router.post("/enroll", enrollCourseController);
router.post("/progress", updateProgressController);
router.post("/assignment/submit", submitAssignmentController);
router.post("/quiz/submit", submitQuizController);
router.get("/certificate/:courseId", getCertificateController);
router.get("/progress/course/:courseId", getProgressDetailsController);
router.get("/analytics/insights", getStudentAnalyticsInsightsController);

// ── Netflix Course Player ─────────────────────────────────────────────────────
router.get("/course-player/:courseId", getCoursePlayerDetails);
router.post("/progress/update", updateWatchProgress);
router.post("/notes", createOrUpdateNote);
router.get("/notes/:courseId", getStudentNotes);
router.post("/bookmarks", createBookmark);
router.get("/bookmarks/:courseId", getStudentBookmarks);
router.get("/course/:courseId/discussions", getDiscussionMessages);
router.post("/course/:courseId/discussions", postDiscussionMessage);

// ── Attendance ────────────────────────────────────────────────────────────────
// GET /api/student/attendance?courseId=&from=&to=
router.get("/attendance", getMyAttendanceController);

// GET /api/student/attendance/calendar?courseId=&month=YYYY-MM
router.get("/attendance/calendar", getMyAttendanceCalendarController);

// GET /api/student/attendance/percentage
router.get("/attendance/percentage", getMyAttendancePercentageController);

export default router;