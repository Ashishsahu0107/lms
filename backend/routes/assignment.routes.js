import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { Assignment } from "../models/Assignment.js";
import { ForbiddenError } from "../utils/errors.js";
import {
  getAssignmentsController,
  getAssignmentByIdController,
  createAssignmentController,
  updateAssignmentController,
  deleteAssignmentController,
  generateAssignmentController,
} from "../controllers/assignment.controller.js";

const router = Router();

// Local ownership middleware for assignments
async function assignmentOwnershipMiddleware(req, res, next) {
  try {
    const { id } = req.params;

    if (req.user.role === "super_admin") {
      return next();
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Teachers can only modify assignments they created
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you do not own this assignment",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

// Public endpoints (Viewable by students, teachers, admins)
router.get("/", authenticate, getAssignmentsController);
router.get("/:id", authenticate, getAssignmentByIdController);

// Creation and AI generation (Teacher / Admin-only)
router.post(
  "/",
  authenticate,
  authorize("teacher", "super_admin"),
  createAssignmentController,
);
router.post(
  "/generate",
  authenticate,
  authorize("teacher", "super_admin"),
  generateAssignmentController,
);

// Modification and Deletion (Teacher / Admin-only, verified by ownership)
router.put(
  "/:id",
  authenticate,
  authorize("teacher", "super_admin"),
  assignmentOwnershipMiddleware,
  updateAssignmentController,
);
router.delete(
  "/:id",
  authenticate,
  authorize("teacher", "super_admin"),
  assignmentOwnershipMiddleware,
  deleteAssignmentController,
);

export default router;
