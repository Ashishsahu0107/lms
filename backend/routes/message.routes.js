import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

import {
  getConversationsController,
  getMessagesController,
  sendMessageController,
  markMessagesReadController,
  deleteMessageController,
} from "../controllers/message.controller.js";

const router = Router();

// =====================================
// PROTECTED ROUTES
// =====================================
router.use(authenticate);

// =====================================
// CONVERSATIONS
// =====================================

// Get All Conversations
router.get(
  "/conversations",
  getConversationsController
);

// =====================================
// MESSAGES
// =====================================

// Get Messages With User
router.get(
  "/:otherId",
  getMessagesController
);

// Send Message
router.post(
  "/",
  sendMessageController
);

// Mark Messages As Read
router.patch(
  "/read/:otherId",
  markMessagesReadController
);

// Delete Message
router.delete(
  "/:messageId",
  deleteMessageController
);

// =====================================
// TEST ROUTE
// =====================================
router.get(
  "/test/realtime",
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Realtime messaging route working",
      realtime: true,
      user: req.user,
    });
  }
);

export default router;