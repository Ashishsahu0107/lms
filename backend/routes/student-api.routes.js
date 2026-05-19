import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getEnrolledCoursesController,
  getCourseDetailsController,
  enrollCourseController,
  updateProgressController,
  submitAssignmentController,
  submitQuizController,
  getCertificateController,
} from "../controllers/student.controller.js";

const router = Router();

// All routes require authenticated student
router.use(authenticate, authorize("student"));

router.get("/courses", getEnrolledCoursesController);
router.get("/course/:id", getCourseDetailsController);
router.post("/enroll", enrollCourseController);
router.post("/progress", updateProgressController);
router.post("/assignment/submit", submitAssignmentController);
router.post("/quiz/submit", submitQuizController);
router.get("/certificate/:courseId", getCertificateController);

export default router;