import { Router } from "express";
import {
  authenticate,
  authorize,
  moduleOwnershipMiddleware,
} from "../middleware/auth.js";
import {
  getModuleByIdController,
  createModuleController,
  updateModuleController,
  deleteModuleController,
} from "../controllers/module.controller.js";

const router = Router();

// All module routes require auth + teacher/admin role
router.use(authenticate, authorize("teacher", "super_admin"));

// GET single module (needed for future module-level pages)
router.get("/:id", getModuleByIdController);

// Create module (only need course ownership implied — checked in controller via courseId)
router.post("/", createModuleController);

// Update & Delete require module ownership verification
router.put("/:id", moduleOwnershipMiddleware, updateModuleController);
router.delete("/:id", moduleOwnershipMiddleware, deleteModuleController);

export default router;
