import { Router } from "express";
import { pingRouter } from "./ping.routes.js";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";

export const rootRouter = Router();

rootRouter.use("/ping", pingRouter);
rootRouter.use("/health", healthRouter);
rootRouter.use("/auth", authRouter);


