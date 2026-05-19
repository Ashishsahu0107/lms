import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  getAssignmentsController,
  createAssignmentController,
  updateAssignmentController,
  deleteAssignmentController,
  gradeSubmissionController,
} from "../controllers/assignment.controller.js";

const router = Router();

router.use(authenticate, authorize("teacher", "super_admin"));

router.get("/", getAssignmentsController);
router.post("/", upload.single("file"), createAssignmentController);
router.put("/:id", updateAssignmentController);
router.delete("/:id", deleteAssignmentController);
router.post("/:id/grade", gradeSubmissionController);

export default router;