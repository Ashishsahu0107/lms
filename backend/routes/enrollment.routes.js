import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  assignCourseController,
  getStudentEnrollmentsController,
  markTopicProgressController,
} from "../controllers/enrollment.controller.js";

const router = Router();

// Endpoint for student to auto-save topic completion (Student-only)
router.post("/progress", authenticate, authorize("student"), markTopicProgressController);

// Endpoint to assign course to student (Teacher/Admin-only)
router.post("/assign", authenticate, authorize("teacher", "super_admin"), assignCourseController);

// Endpoint to get student assigned courses
router.get("/student/:id", authenticate, getStudentEnrollmentsController);

export default router;
