import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getProgressController,
  getCourseProgressController,
  getAttendanceController,
  getAttendanceStatsController,
  markAttendanceController,
  getEarningsController,
  getRevenueStatsController
} from "../controllers/teacherDashboard.controller.js";

const router = Router();

// Progress analytics routes
router.get("/progress", authenticate, authorize("teacher", "super_admin"), getProgressController);
router.get("/course-progress/:id", authenticate, authorize("teacher", "super_admin"), getCourseProgressController);

// Attendance analytics routes
router.get("/attendance", authenticate, authorize("teacher", "super_admin"), getAttendanceController);
router.get("/attendance/stats", authenticate, authorize("teacher", "super_admin"), getAttendanceStatsController);
router.post("/attendance/mark", authenticate, authorize("teacher", "super_admin"), markAttendanceController);

// Earnings analytics routes
router.get("/earnings", authenticate, authorize("teacher", "super_admin"), getEarningsController);
router.get("/revenue/stats", authenticate, authorize("teacher", "super_admin"), getRevenueStatsController);

export default router;
