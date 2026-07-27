import { Router } from "express";
import {
  authenticate,
  authorize,
  topicOwnershipMiddleware,
} from "../middleware/auth.js";
import {
  getTopicByIdController,
  createTopicController,
  updateTopicController,
  deleteTopicController,
} from "../controllers/topic.controller.js";

const router = Router();

// All topic routes require auth + teacher/admin role
router.use(authenticate, authorize("teacher", "super_admin"));

// GET single topic (needed for player page & edit prefill)
router.get("/:id", getTopicByIdController);

// Create topic (parent module ownership validated inside controller)
router.post("/", createTopicController);

// Update & Delete require topic ownership verification (traverses topic → module → course → teacherId)
router.put("/:id", topicOwnershipMiddleware, updateTopicController);
router.delete("/:id", topicOwnershipMiddleware, deleteTopicController);

export default router;
