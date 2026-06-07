import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getCourseStudentsAttendanceController,
  markCourseAttendanceController,
  updateAttendanceController,
  getAttendanceHistoryController,
  getAttendanceByDateController,
  getAttendanceStatsController,
  createAttendanceSessionController,
  getCourseSessionsController,
  deleteAttendanceSessionController,
} from "../controllers/attendance.controller.js";

const router = Router();
const teacherGuard = [authenticate, authorize("teacher", "super_admin")];

// ── Attendance Session Management ─────────────────────────────────────────────
// POST   /api/attendance/sessions
router.post("/sessions", ...teacherGuard, createAttendanceSessionController);

// GET    /api/attendance/course/:courseId/sessions
router.get("/course/:courseId/sessions", ...teacherGuard, getCourseSessionsController);

// DELETE /api/attendance/session/:sessionId
router.delete("/session/:sessionId", ...teacherGuard, deleteAttendanceSessionController);

// ── Student/Course Attendance ─────────────────────────────────────────────────
// GET  /api/attendance/course/:courseId/students?date=YYYY-MM-DD
router.get("/course/:courseId/students", ...teacherGuard, getCourseStudentsAttendanceController);

// POST /api/attendance/mark-daily
router.post("/mark-daily", ...teacherGuard, markCourseAttendanceController);

// Backwards compat alias
router.post("/mark", ...teacherGuard, markCourseAttendanceController);

// PUT  /api/attendance/update/:attendanceId
router.put("/update/:attendanceId", ...teacherGuard, updateAttendanceController);

// GET  /api/attendance/history/:courseId?from=&to=&page=&limit=
router.get("/history/:courseId", ...teacherGuard, getAttendanceHistoryController);

// GET  /api/attendance/date/:date?courseId=
router.get("/date/:date", ...teacherGuard, getAttendanceByDateController);

// GET  /api/attendance/stats
router.get("/stats", ...teacherGuard, getAttendanceStatsController);

export default router;
