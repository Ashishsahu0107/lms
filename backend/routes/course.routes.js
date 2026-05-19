import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  getCoursesController,
  createCourseController,
  updateCourseController,
  deleteCourseController,
  getCourseByIdController,
  addLectureController,
} from "../controllers/course.controller.js";

const router = Router();

router.use(authenticate, authorize("teacher", "super_admin"));

router.get("/", getCoursesController);
router.post("/", createCourseController);
router.post("/:id/lectures", upload.single("video"), addLectureController);
router.put("/:id", updateCourseController);
router.delete("/:id", deleteCourseController);
router.get("/:id", getCourseByIdController);

export default router;