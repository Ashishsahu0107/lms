import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getDashboardStatsController,
  getRevenueDataController,
  getTeachersController,
  updateTeacherController,
  deleteTeacherController,
  getStudentsController,
  updateStudentController,
  deleteStudentController,
  getCoursesController,
  updateCourseController,
  deleteCourseController,
  getPaymentsController,
  getReportDataController,
  getNotificationsController,
  getSettingsController,
  updateSettingsController,
  getAuditLogsController,
} from "../controllers/admin.controller.js";

const router = Router();

// All routes require super_admin authentication
router.use(authenticate, authorize("super_admin"));

// Dashboard
router.get("/dashboard/stats", getDashboardStatsController);
router.get("/dashboard/revenue", getRevenueDataController);

// Teachers
router.get("/teachers", getTeachersController);
router.put("/teacher/:id", updateTeacherController);
router.delete("/teacher/:id", deleteTeacherController);

// Students
router.get("/students", getStudentsController);
router.put("/student/:id", updateStudentController);
router.delete("/student/:id", deleteStudentController);

// Courses
router.get("/courses", getCoursesController);
router.put("/course/:id", updateCourseController);
router.delete("/course/:id", deleteCourseController);

// Payments
router.get("/payments", getPaymentsController);

// Reports
router.get("/reports", getReportDataController);

// Notifications
router.get("/notifications", getNotificationsController);

// Settings
router.get("/settings", getSettingsController);
router.put("/settings", updateSettingsController);

// Audit Logs
router.get("/audit-logs", getAuditLogsController);

export default router;