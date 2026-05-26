import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getCalendarEvents, createSchedule, deleteSchedule } from "../controllers/schedule.controller.js";

const router = Router();

// Protect all schedule routes
router.use(authenticate);

// Student/Teacher/Admin can fetch calendar timeline
router.get("/calendar", getCalendarEvents);

// Only Teacher and Admin can create schedules/live classes
router.post("/", authorize("teacher", "super_admin"), createSchedule);

// Delete schedule
router.delete("/:id", authorize("teacher", "super_admin"), deleteSchedule);

export default router;
