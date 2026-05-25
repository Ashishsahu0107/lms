import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getAdminStatsController,
  getAdminAnalyticsController,
  getTeacherStatsController,
  getTeacherAnalyticsController,
  getStudentStatsController,
  getStudentProgressController,
} from "../controllers/dashboard.controller.js";

const router = Router();

// Super Admin Stats & Growth Analytics
router.get("/admin/stats", authenticate, authorize("super_admin"), getAdminStatsController);
router.get("/admin/analytics", authenticate, authorize("super_admin"), getAdminAnalyticsController);

// Teacher Dashboard Course Stats & Completion Analytics
router.get("/teacher/stats", authenticate, authorize("teacher", "super_admin"), getTeacherStatsController);
router.get("/teacher/analytics", authenticate, authorize("teacher", "super_admin"), getTeacherAnalyticsController);

// Student Dashboard Progress & Learning Timelines
router.get("/student/stats", authenticate, getStudentStatsController);
router.get("/student/progress", authenticate, getStudentProgressController);

export default router;
