import { Router } from "express";
import { pingRouter } from "./ping.routes.js";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import courseRouter from "./course.routes.js";
import studentRouter from "./student.routes.js";
import studentApiRouter from "./student-api.routes.js";
import assignmentRouter from "./assignment.routes.js";
import quizRouter from "./quiz.routes.js";
import analyticsRouter from "./analytics.routes.js";
import messageRouter from "./message.routes.js";
import adminRouter from "./admin.routes.js";

export const rootRouter = Router();

rootRouter.use("/ping", pingRouter);
rootRouter.use("/health", healthRouter);
rootRouter.use("/auth", authRouter);
rootRouter.use("/teacher/courses", courseRouter);
rootRouter.use("/teacher/students", studentApiRouter);
rootRouter.use("/student", studentRouter);
rootRouter.use("/teacher/assignments", assignmentRouter);
rootRouter.use("/teacher/quizzes", quizRouter);
rootRouter.use("/teacher/analytics", analyticsRouter);
rootRouter.use("/messages", messageRouter);
rootRouter.use("/admin", adminRouter);