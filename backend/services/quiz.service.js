import { Quiz } from "../models/Quiz.js";
import { NotFoundError } from "../utils/errors.js";

export const quizService = {
  async getQuizzesByTeacher(teacherId) {
    return Quiz.find({ teacherId })
      .populate("courseId", "title")
      .sort({ createdAt: -1 });
  },

  async createQuiz(teacherId, data) {
    return Quiz.create({ ...data, teacherId });
  },

  async updateQuiz(quizId, teacherId, updates) {
    const quiz = await Quiz.findOne({ _id: quizId, teacherId });
    if (!quiz) throw new NotFoundError("Quiz not found");
    Object.assign(quiz, updates);
    await quiz.save();
    return quiz.populate("courseId", "title");
  },

  async deleteQuiz(quizId, teacherId) {
    const quiz = await Quiz.findOneAndDelete({ _id: quizId, teacherId });
    if (!quiz) throw new NotFoundError("Quiz not found");
    return quiz;
  },

  async getQuizResults(quizId, teacherId) {
    const quiz = await Quiz.findOne({ _id: quizId, teacherId })
      .populate("results.studentId", "name email avatar");
    if (!quiz) throw new NotFoundError("Quiz not found");
    return quiz;
  },
};