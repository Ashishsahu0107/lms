import { Router } from "express";
import {
  authenticate,
  authorize,
  ownershipMiddleware,
} from "../middleware/auth.js";
import { uploadThumbnail } from "../middleware/upload.js";
import {
  getCoursesController,
  createCourseController,
  updateCourseController,
  deleteCourseController,
  getCourseByIdController,
} from "../controllers/course.controller.js";

const router = Router();

// ── READ (all authenticated roles)
router.get("/", authenticate, getCoursesController);
router.get("/:id", authenticate, getCourseByIdController);

// ── CREATE  — teacher/admin only
// uploadThumbnail.single("thumbnail") must come BEFORE the controller
// so that multer parses multipart/form-data and populates req.body + req.file
router.post(
  "/",
  authenticate,
  authorize("teacher", "super_admin"),
  uploadThumbnail.single("thumbnail"),
  createCourseController,
);

// ── UPDATE  — teacher (own course) / admin
router.put(
  "/:id",
  authenticate,
  authorize("teacher", "super_admin"),
  ownershipMiddleware,
  uploadThumbnail.single("thumbnail"),
  updateCourseController,
);

// ── DELETE  — teacher (own course) / admin
router.delete(
  "/:id",
  authenticate,
  authorize("teacher", "super_admin"),
  ownershipMiddleware,
  deleteCourseController,
);

export default router;
