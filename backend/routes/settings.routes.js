import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getSettingsProfileController,
  updateSettingsProfileController,
  changeSettingsPasswordController,
  updateSettingsPreferencesController,
  getGlobalSettingsController,
  updateGlobalSettingsController,
} from "../controllers/settings.controller.js";
import { authorize } from "../middleware/auth.js";

const router = Router();

// All settings endpoints require authentication
router.use(authenticate);

router.get("/profile", getSettingsProfileController);
router.put("/profile", updateSettingsProfileController);
router.put("/password", changeSettingsPasswordController);
router.put("/preferences", updateSettingsPreferencesController);

// Global settings panels (Super Admin only)
router.get("/global", authorize("super_admin"), getGlobalSettingsController);
router.put("/global", authorize("super_admin"), updateGlobalSettingsController);

export default router;
