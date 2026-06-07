import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Quiz } from "../models/Quiz.js";
import { Question } from "../models/Question.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { Enrollment } from "../models/Enrollment.js";

// Helper to shuffle array in-place
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// =====================================
// START QUIZ ATTEMPT (Student-only)
// =====================================
export async function startAttemptController(req, res, next) {
  try {
    const { quizId } = req.body ?? {};

    if (!quizId) {
      throw new BadRequestError("Quiz ID is required to start attempt");
    }

    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    // Verify course enrollment
    const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId: quiz.courseId });
    if (!enrollment && req.user.role === "student") {
      throw new BadRequestError("Access Denied: you must be enrolled in this course to attempt the quiz");
    }

    // Verify attempt limits
    if (quiz.attemptLimit > 0) {
      const pastAttempts = await QuizAttempt.countDocuments({
        studentId: req.user._id,
        quizId,
        status: "completed",
      });

      if (pastAttempts >= quiz.attemptLimit) {
        throw new BadRequestError(`Limit Exceeded: you have already completed the maximum of ${quiz.attemptLimit} attempts allowed for this quiz.`);
      }
    }

    // Shuffle questions if enabled
    let questionsList = [...quiz.questions];
    if (quiz.shuffleQuestions) {
      questionsList = shuffle(questionsList);
    }

    // Create new QuizAttempt
    const attempt = await QuizAttempt.create({
      studentId: req.user._id,
      quizId,
      answers: [],
      score: 0,
      status: "ongoing",
      accuracy: 0,
      timeSpent: 0,
    });

    // Emit quizStarted event
    try {
      const { emitQuizStarted } = await import("../socket/index.js");
      emitQuizStarted(quiz.courseId.toString(), {
        attemptId: attempt._id,
        quizId: quiz._id,
        studentId: req.user._id,
        studentName: req.user.name,
      });
    } catch (e) {
      console.error("Failed to emit quizStarted socket event:", e);
    }

    // Strip correctAnswer and explanation keys from questions to prevent cheating in devtools!
    const secureQuestions = questionsList.map((q) => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      options: q.options,
      marks: q.marks,
      difficulty: q.difficulty,
    }));

    return res.status(201).json({
      success: true,
      message: "Quiz attempt started successfully",
      data: {
        attemptId: attempt._id,
        duration: quiz.duration,
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        title: quiz.title,
        instructions: quiz.instructions,
        shuffleOptions: !!quiz.shuffleOptions,
        startDate: quiz.startDate,
        endDate: quiz.endDate,
        questions: secureQuestions,
      },
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// AUTOSAVE ANSWERS PROGRESS (Student-only)
// =====================================
export async function autosaveAttemptController(req, res, next) {
  try {
    const { attemptId, answers } = req.body ?? {};

    if (!attemptId) {
      throw new BadRequestError("Attempt ID is required to autosave");
    }

    const attempt = await QuizAttempt.findOne({ _id: attemptId, studentId: req.user._id, status: "ongoing" });
    if (!attempt) {
      throw new NotFoundError("Ongoing attempt not found or already completed");
    }

    // Update answers structure
    attempt.answers = (answers || []).map((ans) => ({
      questionId: ans.questionId,
      selectedAnswers: ans.selectedAnswers || [],
      isFlagged: !!ans.isFlagged,
    }));

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Answers saved in background daemon successfully",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// SUBMIT & AUTOMATICALLY GRADE ATTEMPT (Student-only)
// =====================================
export async function submitAttemptController(req, res, next) {
  try {
    const { attemptId, answers, timeSpent } = req.body ?? {};

    if (!attemptId) {
      throw new BadRequestError("Attempt ID is required to submit");
    }

    const attempt = await QuizAttempt.findOne({ _id: attemptId, studentId: req.user._id, status: "ongoing" });
    if (!attempt) {
      throw new NotFoundError("Ongoing attempt not found or already completed");
    }

    const quiz = await Quiz.findById(attempt.quizId).populate("questions");
    if (!quiz) {
      throw new NotFoundError("Associated quiz not found");
    }

    // Update final submitted answers
    const answersMap = new Map((answers || []).map(ans => [ans.questionId.toString(), ans]));

    let achievedScore = 0;
    let correctCount = 0;
    const finalAnswers = [];

    // Evaluate each question dynamically
    for (const question of quiz.questions) {
      const studentAns = answersMap.get(question._id.toString());
      const selected = studentAns ? studentAns.selectedAnswers || [] : [];
      const correct = question.correctAnswer || [];

      let isCorrect = false;

      if (selected.length > 0) {
        if (question.type === "mcq" || question.type === "true_false" || question.type === "short") {
          // Exact string match (case-insensitive for short answers)
          const stdVal = selected[0].toString().trim().toLowerCase();
          const crtVal = correct[0] ? correct[0].toString().trim().toLowerCase() : "";
          if (stdVal === crtVal) {
            isCorrect = true;
          }
        } else if (question.type === "multiple_select") {
          // All correct choices must match
          const stdSet = new Set(selected.map(s => s.toString().trim().toLowerCase()));
          const crtSet = new Set(correct.map(c => c.toString().trim().toLowerCase()));
          
          if (stdSet.size === crtSet.size && [...stdSet].every(item => crtSet.has(item))) {
            isCorrect = true;
          }
        } else {
          // Long/Code questions - fallback to exact match or manual verify
          const stdVal = selected[0] ? selected[0].toString().trim() : "";
          const crtVal = correct[0] ? correct[0].toString().trim() : "";
          if (stdVal && crtVal && stdVal.toLowerCase() === crtVal.toLowerCase()) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) {
        achievedScore += question.marks;
        correctCount++;
      } else {
        // Negative marking subtracts fractional points
        if (quiz.negativeMarking && selected.length > 0) {
          achievedScore -= (question.marks * 0.25); // subtract 25% of question value
        }
      }

      finalAnswers.push({
        questionId: question._id,
        selectedAnswers: selected,
        isFlagged: studentAns ? !!studentAns.isFlagged : false,
      });
    }

    // Keep final score non-negative
    if (achievedScore < 0) achievedScore = 0;

    attempt.answers = finalAnswers;
    attempt.score = Number(achievedScore.toFixed(1));
    attempt.accuracy = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 0;
    attempt.timeSpent = Number(timeSpent) || 0;
    attempt.status = "completed";
    attempt.submittedAt = new Date();

    await attempt.save();

    // Emit real-time quiz submission event
    try {
      let teacherId = null;
      const { Course } = await import("../models/Course.js");
      const course = await Course.findById(quiz.courseId);
      if (course) {
        teacherId = course.teacherId.toString();
      }

      const { emitQuizSubmitted } = await import("../socket/index.js");
      emitQuizSubmitted(quiz.courseId.toString(), teacherId, {
        attemptId: attempt._id,
        quizId: quiz._id,
        quizTitle: quiz.title,
        studentId: req.user._id,
        studentName: req.user.name,
        score: attempt.score,
        totalMarks: quiz.totalMarks,
        accuracy: attempt.accuracy,
        submittedAt: attempt.submittedAt,
      });
    } catch (e) {
      console.error("Failed to emit quiz submission socket event:", e);
    }

    return res.status(200).json({
      success: true,
      message: "Quiz attempt evaluated and graded successfully",
      data: {
        attemptId: attempt._id,
        score: attempt.score,
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        accuracy: attempt.accuracy,
        timeSpent: attempt.timeSpent,
        passed: attempt.score >= quiz.passingMarks,
      },
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// GET ATTEMPTS HISTORY / LIST (Student/Teacher/Admin)
// =====================================
export async function getQuizAttemptsController(req, res, next) {
  try {
    const { quizId } = req.params;

    let query = { quizId };
    if (req.user.role === "student") {
      query.studentId = req.user._id;
    } // Teachers/Admins get all attempts

    const attempts = await QuizAttempt.find(query)
      .populate("studentId", "name email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Attempts fetched successfully",
      data: attempts,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// GET DETAILED SINGLE ATTEMPT WITH EXPLANATION
// =====================================
export async function getSingleAttemptController(req, res, next) {
  try {
    const { id } = req.params;

    const attempt = await QuizAttempt.findById(id)
      .populate("studentId", "name email avatar")
      .populate({
        path: "quizId",
        populate: {
          path: "courseId",
          select: "title"
        }
      });

    if (!attempt) {
      throw new NotFoundError("Quiz attempt details not found");
    }

    if (req.user.role === "student" && attempt.studentId._id.toString() !== req.user._id.toString()) {
      throw new BadRequestError("Access Denied: you can only review your own attempts");
    }

    // Load full populated questions with correct answers & explanation notes
    const questions = await Question.find({ quizId: attempt.quizId._id });

    return res.status(200).json({
      success: true,
      message: "Single attempt audited successfully",
      data: {
        attempt,
        questions,
      },
    });
  } catch (err) {
    next(err);
  }
}
