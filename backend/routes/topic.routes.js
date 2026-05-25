import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createTopicController,
  updateTopicController,
  deleteTopicController,
} from "../controllers/topic.controller.js";

const router = Router();

// Only teachers and admins can manage topics
router.use(authenticate, authorize("teacher", "super_admin"));

router.post("/", createTopicController);
router.put("/:id", updateTopicController);
router.delete("/:id", deleteTopicController);

export default router;
