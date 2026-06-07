import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Quiz } from "../models/Quiz.js";
import { Question } from "../models/Question.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";

// =====================================
// GET COURSE-WISE QUIZZES (Student/Teacher/Admin)
// =====================================
export async function getQuizzesController(req, res, next) {
  try {
    let query = {};

    if (req.user.role === "student") {
      // Fetch only quizzes in courses student is enrolled in
      const enrollments = await Enrollment.find({ studentId: req.user._id });
      const courseIds = enrollments.map((e) => e.courseId);
      query = { courseId: { $in: courseIds }, status: "published" };
    } else if (req.user.role === "teacher") {
      // Fetch quizzes owned by teacher
      query = { createdBy: req.user._id };
    } // Admins get all

    const { courseId } = req.query ?? {};
    if (courseId) {
      query.courseId = courseId;
    }

    const quizzes = await Quiz.find(query)
      .populate("courseId", "title thumbnail")
      .populate("moduleId", "title")
      .populate("topicId", "title")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Quizzes fetched successfully",
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// GET QUIZ BY ID (With populated questions list)
// =====================================
export async function getQuizByIdController(req, res, next) {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate("courseId", "title teacherId")
      .populate("moduleId", "title")
      .populate("topicId", "title")
      .populate("createdBy", "name");

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    // Retrieve associated questions
    const questions = await Question.find({ quizId: id });

    return res.status(200).json({
      success: true,
      message: "Quiz details fetched successfully",
      data: {
        quiz,
        questions,
      },
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// CREATE QUIZ & ASSOCIATED QUESTIONS
// =====================================
export async function createQuizController(req, res, next) {
  try {
    const {
      title,
      description,
      instructions,
      courseId,
      moduleId,
      topicId,
      duration,
      totalMarks,
      passingMarks,
      quizType,
      attemptLimit,
      shuffleQuestions,
      shuffleOptions,
      startDate,
      endDate,
      negativeMarking,
      status,
      questions, // Array of Question objects
    } = req.body ?? {};

    if (!title || !courseId) {
      throw new BadRequestError("Title and Target Course ID are required fields");
    }

    // 1. Create the base Quiz document
    const quiz = await Quiz.create({
      title,
      description: description || "",
      instructions: instructions || "",
      courseId,
      moduleId: moduleId || null,
      topicId: topicId || null,
      createdBy: req.user._id,
      duration: Number(duration) || 30,
      totalMarks: Number(totalMarks) || 100,
      passingMarks: Number(passingMarks) || 40,
      quizType: quizType || "exam",
      attemptLimit: attemptLimit !== undefined ? Number(attemptLimit) : 1,
      shuffleQuestions: !!shuffleQuestions,
      shuffleOptions: !!shuffleOptions,
      startDate: startDate || null,
      endDate: endDate || null,
      negativeMarking: !!negativeMarking,
      status: status || "published",
      questions: [],
    });

    // 2. Insert questions if provided
    let questionRefs = [];
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionsData = questions.map((q) => ({
        quizId: quiz._id,
        type: q.type || "mcq",
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || [],
        explanation: q.explanation || "",
        marks: Number(q.marks) || 5,
        difficulty: q.difficulty || "medium",
      }));

      const createdQuestions = await Question.insertMany(questionsData);
      questionRefs = createdQuestions.map((q) => q._id);
      
      // Update Quiz with reference IDs
      quiz.questions = questionRefs;
      await quiz.save();
    }

    // Emit live socket events
    try {
      const { emitQuizCreated, emitQuizPublished } = await import("../socket/index.js");
      emitQuizCreated(quiz);
      if (quiz.status === "published") {
        emitQuizPublished(quiz);
      }
    } catch (e) {
      console.error("Failed to emit quizCreated socket event:", e);
    }

    return res.status(201).json({
      success: true,
      message: "Quiz and question cards created successfully",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// UPDATE QUIZ & QUESTIONS
// =====================================
export async function updateQuizController(req, res, next) {
  try {
    const { id } = req.params;
    const { questions, ...quizUpdates } = req.body ?? {};

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    const oldStatus = quiz.status;

    // Apply updates on base Quiz
    Object.assign(quiz, quizUpdates);

    // Replace questions array if provided
    if (questions && Array.isArray(questions)) {
      // Cascade delete previous questions
      await Question.deleteMany({ quizId: id });

      // Insert new questions list
      const questionsData = questions.map((q) => ({
        quizId: id,
        type: q.type || "mcq",
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || [],
        explanation: q.explanation || "",
        marks: Number(q.marks) || 5,
        difficulty: q.difficulty || "medium",
      }));

      const createdQuestions = await Question.insertMany(questionsData);
      quiz.questions = createdQuestions.map((q) => q._id);
    }

    await quiz.save();

    // Emit live socket events
    try {
      const { emitQuizUpdated, emitQuizPublished } = await import("../socket/index.js");
      emitQuizUpdated(quiz);
      if (quiz.status === "published" && oldStatus !== "published") {
        emitQuizPublished(quiz);
      }
    } catch (e) {
      console.error("Failed to emit quizUpdated socket event:", e);
    }

    return res.status(200).json({
      success: true,
      message: "Quiz and questions updated successfully",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// DELETE QUIZ (Cascade deletes attempts & questions)
// =====================================
export async function deleteQuizController(req, res, next) {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    // Purge associated Question documents
    await Question.deleteMany({ quizId: id });

    // Purge associated Attempt logs
    await QuizAttempt.deleteMany({ quizId: id });

    // Delete Quiz
    await Quiz.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Quiz, questions list, and attempts log permanently deleted",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// GET QUIZ ANALYTICS (Teacher/Admin only)
// =====================================
export async function getQuizAnalyticsController(req, res, next) {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    // Fetch all completed attempts
    const attempts = await QuizAttempt.find({ quizId: id, status: "completed" })
      .populate("studentId", "name email avatar")
      .sort({ score: -1, timeSpent: 1 });

    const totalAttemptsCount = attempts.length;
    const uniqueStudentsSet = new Set(attempts.map((a) => a.studentId?._id?.toString()));
    const uniqueStudentsCount = uniqueStudentsSet.size;

    let averageScore = 0;
    let passingAttemptsCount = 0;
    const scoreBuckets = { "0-20%": 0, "21-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 };

    if (totalAttemptsCount > 0) {
      let sumScores = 0;
      attempts.forEach((a) => {
        sumScores += a.score;
        if (a.score >= quiz.passingMarks) {
          passingAttemptsCount++;
        }

        const pct = quiz.totalMarks > 0 ? (a.score / quiz.totalMarks) * 100 : 0;
        if (pct <= 20) scoreBuckets["0-20%"]++;
        else if (pct <= 40) scoreBuckets["21-40%"]++;
        else if (pct <= 60) scoreBuckets["41-60%"]++;
        else if (pct <= 80) scoreBuckets["61-80%"]++;
        else scoreBuckets["81-100%"]++;
      });

      averageScore = Number((sumScores / totalAttemptsCount).toFixed(1));
    }

    const passRate = totalAttemptsCount > 0 ? Math.round((passingAttemptsCount / totalAttemptsCount) * 100) : 0;

    // Leaderboard logic: group highest attempts of each student
    const studentBestAttempts = {};
    attempts.forEach((a) => {
      const sId = a.studentId?._id?.toString();
      if (!sId) return;

      if (!studentBestAttempts[sId] || studentBestAttempts[sId].score < a.score) {
        studentBestAttempts[sId] = a;
      }
    });

    const leaderboard = Object.values(studentBestAttempts)
      .sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      message: "Quiz performance analytics calculated successfully",
      data: {
        totalAttempts: totalAttemptsCount,
        uniqueStudents: uniqueStudentsCount,
        averageScore,
        passRate,
        scoreBuckets,
        leaderboard,
        attemptsHistory: attempts.slice(0, 30), // Return recent 30 attempts for logs
      },
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// GET QUESTION BANK (Teacher only)
// =====================================
export async function getQuestionBankController(req, res, next) {
  try {
    let query = {};
    if (req.user.role !== "super_admin") {
      const quizzes = await Quiz.find({ createdBy: req.user._id }).select("_id");
      const quizIds = quizzes.map(q => q._id);
      query = { quizId: { $in: quizIds } };
    }
    const questions = await Question.find(query).populate("quizId", "title");
    return res.status(200).json({
      success: true,
      message: "Question bank fetched successfully",
      data: questions,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// CLONE QUIZ
// =====================================
export async function cloneQuizController(req, res, next) {
  try {
    const { id } = req.params;

    const originalQuiz = await Quiz.findById(id);
    if (!originalQuiz) {
      throw new NotFoundError("Quiz to clone not found");
    }

    // Create cloned quiz document
    const cloneData = {
      title: `Copy of ${originalQuiz.title}`,
      description: originalQuiz.description,
      instructions: originalQuiz.instructions,
      courseId: originalQuiz.courseId,
      moduleId: originalQuiz.moduleId,
      topicId: originalQuiz.topicId,
      createdBy: req.user._id,
      duration: originalQuiz.duration,
      totalMarks: originalQuiz.totalMarks,
      passingMarks: originalQuiz.passingMarks,
      quizType: originalQuiz.quizType,
      attemptLimit: originalQuiz.attemptLimit,
      shuffleQuestions: originalQuiz.shuffleQuestions,
      shuffleOptions: originalQuiz.shuffleOptions,
      startDate: originalQuiz.startDate,
      endDate: originalQuiz.endDate,
      negativeMarking: originalQuiz.negativeMarking,
      status: "draft", // default to draft
      questions: [],
    };

    const clonedQuiz = await Quiz.create(cloneData);

    // Fetch and clone questions
    const originalQuestions = await Question.find({ quizId: id });
    if (originalQuestions.length > 0) {
      const clonedQuestionsData = originalQuestions.map((q) => ({
        quizId: clonedQuiz._id,
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || [],
        explanation: q.explanation || "",
        marks: q.marks,
        difficulty: q.difficulty,
      }));

      const createdQuestions = await Question.insertMany(clonedQuestionsData);
      clonedQuiz.questions = createdQuestions.map(q => q._id);
      await clonedQuiz.save();
    }

    // Emit socket event for quiz creation
    try {
      const { emitQuizCreated } = await import("../socket/index.js");
      emitQuizCreated(clonedQuiz);
    } catch (e) {
      console.error("Failed to emit quizCreated socket event for clone:", e);
    }

    return res.status(201).json({
      success: true,
      message: "Quiz cloned successfully",
      data: clonedQuiz,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// BULK IMPORT QUESTIONS
// =====================================
export async function bulkImportQuestionsController(req, res, next) {
  try {
    const { id } = req.params;
    const { questions } = req.body ?? {};

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestError("Questions array is required and must not be empty");
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    const questionsData = questions.map((q) => {
      if (!q.question || !q.type) {
        throw new BadRequestError("Each imported question must contain a 'question' and a 'type' field");
      }
      return {
        quizId: id,
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || [],
        explanation: q.explanation || "",
        marks: Number(q.marks) || 5,
        difficulty: q.difficulty || "medium",
      };
    });

    const createdQuestions = await Question.insertMany(questionsData);
    const questionRefs = createdQuestions.map((q) => q._id);

    quiz.questions = [...(quiz.questions || []), ...questionRefs];
    
    // Increment total marks by newly added questions marks
    const sumMarks = createdQuestions.reduce((sum, q) => sum + q.marks, 0);
    quiz.totalMarks = (quiz.totalMarks || 0) + sumMarks;

    await quiz.save();

    // Emit socket event for quiz update
    try {
      const { emitQuizUpdated } = await import("../socket/index.js");
      emitQuizUpdated(quiz);
    } catch (e) {
      console.error("Failed to emit quizUpdated socket event for bulk import:", e);
    }

    return res.status(200).json({
      success: true,
      message: `${createdQuestions.length} questions imported successfully`,
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
}