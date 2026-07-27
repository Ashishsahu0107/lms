import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAiChats,
  createAiChat,
  getAiChatDetails,
  deleteAiChat,
} from "../controllers/aiChat.controller.js";

const router = Router();

// Secure conversation logs
router.use(authenticate);

router.get("/chats", getAiChats);
router.post("/chats", createAiChat);
router.get("/chats/:chatId", getAiChatDetails);
router.delete("/chats/:chatId", deleteAiChat);

export default router;
