import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  startAttemptController,
  autosaveAttemptController,
  submitAttemptController,
  getQuizAttemptsController,
  getSingleAttemptController,
} from "../controllers/quizAttempt.controller.js";

const router = Router();

// Student-only attempt lifecycle
router.post(
  "/start",
  authenticate,
  authorize("student"),
  startAttemptController,
);
router.post(
  "/autosave",
  authenticate,
  authorize("student"),
  autosaveAttemptController,
);
router.post(
  "/submit",
  authenticate,
  authorize("student"),
  submitAttemptController,
);

// Attempts lists and audit reviews
router.get("/quiz/:quizId", authenticate, getQuizAttemptsController);
router.get("/single/:id", authenticate, getSingleAttemptController);

export default router;
