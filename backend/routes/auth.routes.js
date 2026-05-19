import { Router } from "express";
import { loginController, registerController, meController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.get("/me", authenticate, meController);

export default router;