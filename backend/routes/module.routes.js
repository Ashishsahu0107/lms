import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createModuleController,
  updateModuleController,
  deleteModuleController,
} from "../controllers/module.controller.js";

const router = Router();

// Only teachers and admins can manage modules
router.use(authenticate, authorize("teacher", "super_admin"));

router.post("/", createModuleController);
router.put("/:id", updateModuleController);
router.delete("/:id", deleteModuleController);

export default router;
