import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { globalSearch } from "../controllers/search.controller.js";

const router = Router();

// Secure search routes
router.use(authenticate);

router.get("/global", globalSearch);

export default router;
