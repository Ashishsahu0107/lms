import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { Quiz } from "../models/Quiz.js";
import {
  getQuizzesController,
  getQuizByIdController,
  createQuizController,
  updateQuizController,
  deleteQuizController,
  getQuizAnalyticsController,
  getQuestionBankController,
  cloneQuizController,
  bulkImportQuestionsController,
} from "../controllers/quiz.controller.js";

const router = Router();

// Local ownership middleware for quizzes
async function quizOwnershipMiddleware(req, res, next) {
  try {
    const { id } = req.params;

    if (req.user.role === "super_admin") {
      return next();
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Teachers can only modify quizzes they created
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: you do not own this quiz card",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

// Question Bank endpoint (Browse past questions - must be placed before :id parameter route!)
router.get("/bank/questions", authenticate, authorize("teacher", "super_admin"), getQuestionBankController);

// Public endpoints (Viewable by students, teachers, admins)
router.get("/", authenticate, getQuizzesController);
router.get("/:id", authenticate, getQuizByIdController);

// Creation (Teacher / Admin-only)
router.post("/", authenticate, authorize("teacher", "super_admin"), createQuizController);

// Cloning and Import Actions
router.post("/:id/clone", authenticate, authorize("teacher", "super_admin"), quizOwnershipMiddleware, cloneQuizController);
router.post("/:id/import-questions", authenticate, authorize("teacher", "super_admin"), quizOwnershipMiddleware, bulkImportQuestionsController);

// Modification, Deletion, and Analytics (Teacher / Admin-only, verified by ownership)
router.put("/:id", authenticate, authorize("teacher", "super_admin"), quizOwnershipMiddleware, updateQuizController);
router.delete("/:id", authenticate, authorize("teacher", "super_admin"), quizOwnershipMiddleware, deleteQuizController);
router.get("/:id/analytics", authenticate, authorize("teacher", "super_admin"), quizOwnershipMiddleware, getQuizAnalyticsController);

export default router;