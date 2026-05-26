import { Router } from "express";

// =====================================
// ROUTE IMPORTS
// =====================================
import { pingRouter } from "./ping.routes.js";
import { healthRouter } from "./health.routes.js";
import authRouter from "./auth.routes.js";

import courseRouter from "./course.routes.js";
import moduleRouter from "./module.routes.js";
import topicRouter from "./topic.routes.js";
import enrollmentRouter from "./enrollment.routes.js";

import studentRouter from "./student.routes.js";
import studentApiRouter from "./student-api.routes.js";

import assignmentRouter from "./assignment.routes.js";
import submissionRouter from "./submission.routes.js";
import quizRouter from "./quiz.routes.js";
import quizAttemptRouter from "./quizAttempt.routes.js";
import dashboardRouter from "./dashboard.routes.js";
import analyticsRouter from "./analytics.routes.js";
import messageRouter from "./message.routes.js";
import adminRouter from "./admin.routes.js";
import adminModulesRouter from "./adminModules.routes.js";
import teacherDashboardRouter from "./teacherDashboard.routes.js";
import attendanceRouter from "./attendance.routes.js";
import certificateRouter from "./certificate.routes.js";
import settingsRouter from "./settings.routes.js";

// =====================================
// ROOT ROUTER
// =====================================
export const rootRouter = Router();

// =====================================
// SYSTEM ROUTES
// =====================================
rootRouter.use("/ping", pingRouter);
rootRouter.use("/health", healthRouter);

// =====================================
// AUTH ROUTES
// =====================================
rootRouter.use("/auth", authRouter);

// =====================================
// STUDENT DASHBOARD ROUTES (Student-facing)
// =====================================
rootRouter.use("/student", studentApiRouter);

// =====================================
// STUDENT MANAGEMENT ROUTES (Teacher/Admin-facing)
// =====================================
rootRouter.use("/teacher/students", studentRouter);

// =====================================
// COURSE MANAGEMENT SYSTEM API ROUTES
// =====================================
rootRouter.use("/courses", courseRouter);
rootRouter.use("/modules", moduleRouter);
rootRouter.use("/topics", topicRouter);
rootRouter.use("/enrollments", enrollmentRouter);
rootRouter.use("/assignments", assignmentRouter);
rootRouter.use("/submissions", submissionRouter);
rootRouter.use("/quizzes", quizRouter);
rootRouter.use("/quiz-attempts", quizAttemptRouter);
rootRouter.use("/dashboard", dashboardRouter);
rootRouter.use("/teacher", teacherDashboardRouter);
rootRouter.use("/attendance", attendanceRouter);
rootRouter.use("/certificates", certificateRouter);
rootRouter.use("/settings", settingsRouter);


// =====================================
// TEACHER MODULE ROUTES (Backward Compatibility)
// =====================================
rootRouter.use("/teacher/courses", courseRouter);
rootRouter.use("/teacher/assignments", assignmentRouter);
rootRouter.use("/teacher/quizzes", quizRouter);
rootRouter.use("/teacher/analytics", analyticsRouter);

// =====================================
// MESSAGES & ADMIN
// =====================================
rootRouter.use("/messages", messageRouter);
rootRouter.use("/admin", adminRouter);
rootRouter.use("/admin", adminModulesRouter);

// =====================================
// API ROOT DESCRIPTIVE ENDPOINT
// =====================================
rootRouter.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS Pro API Running Successfully",
    version: "2.0.0",
    realtime: true,
    endpoints: {
      auth: "/api/auth",
      courses: "/api/courses",
      modules: "/api/modules",
      topics: "/api/topics",
      enrollments: "/api/enrollments",
      studentDashboard: "/api/student",
      teacherStudents: "/api/teacher/students",
      messages: "/api/messages",
      admin: "/api/admin",
    },
  });
});