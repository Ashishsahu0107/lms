import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAiRecommendations,
  generateAiQuiz,
  aiAssistant,
  aiChatController,
  aiSummarizeController,
  generateAiNotesController,
} from "../controllers/ai.controller.js";
import {
  getAiChats,
  createAiChat,
  getAiChatDetails,
  deleteAiChat
} from "../controllers/aiChat.controller.js";

const router = Router();

// Secure AI routes
router.use(authenticate);

router.post("/recommendations", getAiRecommendations);
router.post("/generate-quiz", generateAiQuiz);
router.post("/assistant", aiAssistant);
router.post("/chat", aiChatController);
router.post("/summarize", aiSummarizeController);
router.post("/generate-notes", generateAiNotesController);

// AI Chat Thread History Routes
router.get("/chats", getAiChats);
router.post("/chats", createAiChat);
router.get("/chats/:chatId", getAiChatDetails);
router.delete("/chats/:chatId", deleteAiChat);

export default router;
