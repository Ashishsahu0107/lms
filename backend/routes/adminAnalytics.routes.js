import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getOverview,
  getUsers,
  getCourses,
  getRevenue,
  getPerformance,
  getAttendance,
  getRealtime
} from "../controllers/analytics.controller.js";

const router = Router();

// Secure all analytics endpoints for Super Admin role
router.use(authenticate, authorize("super_admin"));

router.get("/overview", getOverview);
router.get("/users", getUsers);
router.get("/courses", getCourses);
router.get("/revenue", getRevenue);
router.get("/performance", getPerformance);
router.get("/attendance", getAttendance);
router.get("/realtime", getRealtime);

export default router;
