import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  submitAssignmentController,
  getAssignmentSubmissionsController,
  getSubmissionByIdController,
  reviewSubmissionController,
  uploadSubmissionFileController,
} from "../controllers/submission.controller.js";

const router = Router();

// Student-only file upload endpoint
router.post("/upload", authenticate, authorize("student"), upload.single("file"), uploadSubmissionFileController);

// Student-only submission creation/resubmission
router.post("/", authenticate, authorize("student"), submitAssignmentController);

// Teacher/Admin-only single submission fetching for detailed review
router.get("/single/:id", authenticate, authorize("teacher", "super_admin"), getSubmissionByIdController);

// Teacher/Admin-only submission index fetching for evaluation
router.get("/:assignmentId", authenticate, authorize("teacher", "super_admin"), getAssignmentSubmissionsController);

// Teacher/Admin-only grading review updates
router.put("/:id/review", authenticate, authorize("teacher", "super_admin"), reviewSubmissionController);

export default router;

