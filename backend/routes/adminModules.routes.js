import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getPaymentsController,
  getInvoicesController,
  getSubscriptionsController,
  processRefundController,
  getStudentReportsController,
  getTeacherReportsController,
  getRevenueReportsController,
  getCourseReportsController,
  getPlatformAnalyticsController,
  getUserAnalyticsController,
  getCourseAnalyticsController,
  getQuizAnalyticsController,
  getNotificationsController,
  sendNotificationController,
  getSecurityLogsController,
  getSessionsController,
  getSettingsController,
  updateSettingsController,
} from "../controllers/adminModules.controller.js";

const router = Router();

// Secure all modules with authentication and super admin authorization
router.use(authenticate, authorize("super_admin"));

// Payments APIs
router.get("/payments", getPaymentsController);
router.get("/invoices", getInvoicesController);
router.get("/subscriptions", getSubscriptionsController);
router.post("/payments/refund", processRefundController);

// Reports APIs
router.get("/reports/students", getStudentReportsController);
router.get("/reports/teachers", getTeacherReportsController);
router.get("/reports/revenue", getRevenueReportsController);
router.get("/reports/courses", getCourseReportsController);

// Analytics APIs
router.get("/analytics/platform", getPlatformAnalyticsController);
router.get("/analytics/users", getUserAnalyticsController);
router.get("/analytics/courses", getCourseAnalyticsController);
router.get("/analytics/quizzes", getQuizAnalyticsController);

// Notifications APIs
router.get("/notifications", getNotificationsController);
router.post("/notifications/send", sendNotificationController);

// Security APIs
router.get("/security/logs", getSecurityLogsController);
router.get("/security/sessions", getSessionsController);

// Settings APIs
router.get("/settings", getSettingsController);
router.put("/settings/update", updateSettingsController);

export default router;
