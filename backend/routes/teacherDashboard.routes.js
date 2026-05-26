import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getProgressController,
  getCourseProgressController,
  getEarningsController,
  getRevenueStatsController,
} from "../controllers/teacherDashboard.controller.js";

const router = Router();

const guard = [authenticate, authorize("teacher", "super_admin")];

// ── Progress Analytics ────────────────────────────────────────────────────────
router.get("/progress", ...guard, getProgressController);
router.get("/course-progress/:id", ...guard, getCourseProgressController);

// ── Earnings Analytics ────────────────────────────────────────────────────────
router.get("/earnings", ...guard, getEarningsController);
router.get("/revenue/stats", ...guard, getRevenueStatsController);

// NOTE: Attendance routes are registered under /api/attendance/ (attendance.routes.js)
// GET  /api/attendance/course/:courseId/students?date=YYYY-MM-DD
// POST /api/attendance/mark
// GET  /api/attendance/stats

export default router;
