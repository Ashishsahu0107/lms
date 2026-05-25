import { Router } from "express";
import { authenticate, authorize, ownershipMiddleware } from "../middleware/auth.js";
import {
  getCoursesController,
  createCourseController,
  updateCourseController,
  deleteCourseController,
  getCourseByIdController,
} from "../controllers/course.controller.js";

const router = Router();

// Viewing courses requires basic authentication (student/teacher/admin viewing is allowed)
router.get("/", authenticate, getCoursesController);
router.get("/:id", authenticate, getCourseByIdController);

// Creating courses (Teacher/Admin only)
router.post("/", authenticate, authorize("teacher", "super_admin"), createCourseController);

// Updating and Deleting courses (Teacher/Admin only, must own the course or be super admin)
router.put("/:id", authenticate, authorize("teacher", "super_admin"), ownershipMiddleware, updateCourseController);
router.delete("/:id", authenticate, authorize("teacher", "super_admin"), ownershipMiddleware, deleteCourseController);

export default router;