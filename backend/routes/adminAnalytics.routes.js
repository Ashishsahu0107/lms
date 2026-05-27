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

// Secure all admin analytics endpoints
router.use(authenticate);

router.use((req, res, next) => {
  const path = req.path.split("?")[0];
  if (path.includes("performance") || req.originalUrl.includes("performance")) {
    return next(); // Permit student and teacher access to global leaderboard
  }
  return authorize("super_admin")(req, res, next);
});

router.get("/overview", getOverview);
router.get("/users", getUsers);
router.get("/courses", getCourses);
router.get("/revenue", getRevenue);
router.get("/performance", getPerformance);
router.get("/attendance", getAttendance);
router.get("/realtime", getRealtime);

export default router;
