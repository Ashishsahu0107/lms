import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getSettingsProfileController,
  updateSettingsProfileController,
  changeSettingsPasswordController,
  updateSettingsPreferencesController,
} from "../controllers/settings.controller.js";

const router = Router();

// All settings endpoints require authentication
router.use(authenticate);

router.get("/profile", getSettingsProfileController);
router.put("/profile", updateSettingsProfileController);
router.put("/password", changeSettingsPasswordController);
router.put("/preferences", updateSettingsPreferencesController);

export default router;
