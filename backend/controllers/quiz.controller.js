import { BadRequestError } from "../utils/errors.js";
import { quizService } from "../services/quiz.service.js";

export async function getQuizzesController(req, res, next) {
  try {
    const quizzes = await quizService.getQuizzesByTeacher(req.user._id);
    res.json(quizzes);
  } catch (err) {
    next(err);
  }
}

export async function createQuizController(req, res, next) {
  try {
    const { title, description, courseId, questions, timeLimit, status, totalPoints } = req.body;
    if (!title || !courseId) throw new BadRequestError("title and courseId are required");

    const quiz = await quizService.createQuiz(req.user._id, {
      title, description, courseId, questions, timeLimit, status, totalPoints,
    });
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

export async function updateQuizController(req, res, next) {
  try {
    const { id } = req.params;
    const quiz = await quizService.updateQuiz(id, req.user._id, req.body);
    res.json(quiz);
  } catch (err) {
    next(err);
  }
}

export async function deleteQuizController(req, res, next) {
  try {
    const { id } = req.params;
    await quizService.deleteQuiz(id, req.user._id);
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getQuizResultsController(req, res, next) {
  try {
    const { id } = req.params;
    const quiz = await quizService.getQuizResults(id, req.user._id);
    res.json(quiz);
  } catch (err) {
    next(err);
  }
}