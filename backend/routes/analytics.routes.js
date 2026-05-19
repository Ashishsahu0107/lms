import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getAnalyticsController } from "../controllers/analytics.controller.js";

const router = Router();

router.use(authenticate, authorize("teacher", "super_admin"));
router.get("/", getAnalyticsController);

export default router;