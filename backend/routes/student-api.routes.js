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
} from "../controllers/student.controller.js";
import {
  getMyAttendanceController,
  getMyAttendanceCalendarController,
  getMyAttendancePercentageController,
} from "../controllers/studentAttendance.controller.js";

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

// ── Attendance ────────────────────────────────────────────────────────────────
// GET /api/student/attendance?courseId=&from=&to=
router.get("/attendance", getMyAttendanceController);

// GET /api/student/attendance/calendar?courseId=&month=YYYY-MM
router.get("/attendance/calendar", getMyAttendanceCalendarController);

// GET /api/student/attendance/percentage
router.get("/attendance/percentage", getMyAttendancePercentageController);

export default router;