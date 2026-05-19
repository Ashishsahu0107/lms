import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getQuizzesController,
  createQuizController,
  updateQuizController,
  deleteQuizController,
  getQuizResultsController,
} from "../controllers/quiz.controller.js";

const router = Router();

router.use(authenticate, authorize("teacher", "super_admin"));

router.get("/", getQuizzesController);
router.post("/", createQuizController);
router.put("/:id", updateQuizController);
router.delete("/:id", deleteQuizController);
router.get("/:id/results", getQuizResultsController);

export default router;