export * from "./errors.js";

import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

export const rootRouter = Router();

// Auth Routes
rootRouter.use("/auth", authRoutes);

// User Routes
rootRouter.use("/users", userRoutes);