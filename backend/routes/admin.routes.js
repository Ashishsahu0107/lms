import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getDashboardStatsController,
  getRevenueDataController,
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

import {
  getAdminAttendanceAnalyticsController,
  getAdminAttendanceReportsController,
} from "../controllers/adminAttendance.controller.js";

import {
  createTeacherController,
  getTeachersController,
  getTeacherByIdController,
  updateTeacherController,
  deleteTeacherController,
  getTeacherAnalyticsController,
  createStudentController,
  getStudentsController,
  getStudentByIdController,
  updateStudentController,
  deleteStudentController,
  getStudentAnalyticsController,
  bulkImportUsersController,
  exportUsersController,
} from "../controllers/adminUser.controller.js";

const router = Router();

// All routes require super_admin authentication
router.use(authenticate, authorize("super_admin"));

// Dashboard
router.get("/dashboard/stats", getDashboardStatsController);
router.get("/dashboard/revenue", getRevenueDataController);

// Teachers REST & Analytics
router.post("/teachers", createTeacherController);
router.get("/teachers", getTeachersController);
router.get("/teachers/analytics", getTeacherAnalyticsController);
router.get("/teachers/:id", getTeacherByIdController);
router.put("/teachers/:id", updateTeacherController);
router.delete("/teachers/:id", deleteTeacherController);

// Backwards compatibility alias routes
router.put("/teacher/:id", updateTeacherController);
router.delete("/teacher/:id", deleteTeacherController);

// Students REST & Analytics
router.post("/students", createStudentController);
router.get("/students", getStudentsController);
router.get("/students/analytics", getStudentAnalyticsController);
router.get("/students/:id", getStudentByIdController);
router.put("/students/:id", updateStudentController);
router.delete("/students/:id", deleteStudentController);

// Backwards compatibility alias routes
router.put("/student/:id", updateStudentController);
router.delete("/student/:id", deleteStudentController);

// Bulk user import & export
router.post("/users/bulk-import", bulkImportUsersController);
router.get("/users/export", exportUsersController);

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

// Attendance Analytics
router.get("/attendance/analytics", getAdminAttendanceAnalyticsController);
router.get("/attendance/reports", getAdminAttendanceReportsController);

export default router;