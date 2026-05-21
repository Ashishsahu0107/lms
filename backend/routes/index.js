import { Router } from "express";

// =====================================
// ROUTE IMPORTS
// =====================================
import { pingRouter } from "./ping.routes.js";
import { healthRouter } from "./health.routes.js";

import authRouter from "./auth.routes.js";

import courseRouter from "./course.routes.js";
import studentRouter from "./student.routes.js";
import studentApiRouter from "./student-api.routes.js";

import assignmentRouter from "./assignment.routes.js";
import quizRouter from "./quiz.routes.js";
import analyticsRouter from "./analytics.routes.js";

import messageRouter from "./message.routes.js";

import adminRouter from "./admin.routes.js";

// =====================================
// ROOT ROUTER
// =====================================
export const rootRouter = Router();

// =====================================
// SYSTEM ROUTES
// =====================================

// Ping
rootRouter.use(
  "/ping",
  pingRouter
);

// Health
rootRouter.use(
  "/health",
  healthRouter
);

// =====================================
// AUTH ROUTES
// =====================================
rootRouter.use(
  "/auth",
  authRouter
);

// =====================================
// STUDENT ROUTES
// =====================================

// Student Dashboard APIs
rootRouter.use(
  "/student",
  studentRouter
);

// Student Management APIs
rootRouter.use(
  "/students",
  studentApiRouter
);

// =====================================
// TEACHER ROUTES
// =====================================

// Course Management
rootRouter.use(
  "/teacher/courses",
  courseRouter
);

// Assignment Management
rootRouter.use(
  "/teacher/assignments",
  assignmentRouter
);

// Quiz Management
rootRouter.use(
  "/teacher/quizzes",
  quizRouter
);

// Analytics
rootRouter.use(
  "/teacher/analytics",
  analyticsRouter
);

// =====================================
// MESSAGE ROUTES
// =====================================
rootRouter.use(
  "/messages",
  messageRouter
);

// =====================================
// ADMIN ROUTES
// =====================================
rootRouter.use(
  "/admin",
  adminRouter
);

// =====================================
// API INFO ROUTE
// =====================================
rootRouter.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS Pro API Running Successfully",

    version: "1.0.0",

    realtime: true,

    endpoints: {
      auth: "/api/auth",
      student: "/api/student",
      teacherCourses: "/api/teacher/courses",
      assignments: "/api/teacher/assignments",
      quizzes: "/api/teacher/quizzes",
      analytics: "/api/teacher/analytics",
      messages: "/api/messages",
      admin: "/api/admin",
    },
  });
});