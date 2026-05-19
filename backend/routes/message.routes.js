import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getConversationsController,
  getMessagesController,
  sendMessageController,
} from "../controllers/message.controller.js";

const router = Router();

router.use(authenticate);

router.get("/conversations", getConversationsController);
router.get("/:otherId", getMessagesController);
router.post("/", sendMessageController);

export default router;