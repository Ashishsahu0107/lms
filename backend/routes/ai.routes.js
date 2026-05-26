import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAiRecommendations,
  generateAiQuiz,
  aiAssistant
} from "../controllers/ai.controller.js";

const router = Router();

// Secure AI routes
router.use(authenticate);

router.post("/recommendations", getAiRecommendations);
router.post("/generate-quiz", generateAiQuiz);
router.post("/assistant", aiAssistant);

export default router;
